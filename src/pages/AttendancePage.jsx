import { useEffect, useState } from 'react';
import { http } from '../api/http.js';
import { useAuth } from '../auth/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import Select from '../components/ui/Select.jsx';

export default function AttendancePage() {
  const { role } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [classGroups, setClassGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedClassGroup, setSelectedClassGroup] = useState('');
  const [attendanceData, setAttendanceData] = useState({});
  const [saving, setSaving] = useState(false);

  const canManage = role === 'ADMIN' || role === 'TEACHER';
  const canRecord = canManage || role === 'PARENT';

  useEffect(() => {
    loadStudentsAndClasses();
  }, []);

  useEffect(() => {
    if (selectedClassGroup && selectedDate) {
      loadAttendanceForClass();
    }
  }, [selectedClassGroup, selectedDate]);

  const loadStudentsAndClasses = async () => {
    try {
      const [studentsRes, classesRes] = await Promise.all([
        http.get('/students'),
        http.get('/class-groups'),
      ]);
      setStudents(studentsRes.data);
      setClassGroups(classesRes.data);
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Error loading data');
    }
  };

  const loadAttendanceForClass = async () => {
    if (!selectedClassGroup) return;
    try {
      const res = await http.get(
        `/attendance?classGroupId=${selectedClassGroup}&date=${selectedDate}`,
      );
      const records = res.data;
      const map = {};
      for (const rec of records) {
        map[rec.studentId] = rec;
      }
      setAttendanceData(map);
      // Pre-populate for students without records
      const filteredStudents = students.filter((s) => s.className === selectedClassGroup);
      for (const student of filteredStudents) {
        if (!map[student.id]) {
          map[student.id] = {
            studentId: student.id,
            status: 'PRESENT',
            isExcused: false,
            lateMinutes: 0,
          };
        }
      }
      setAttendanceData({ ...map });
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Error loading attendance');
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status, isExcused: false, lateMinutes: 0 },
    }));
  };

  const handleExcusedChange = (studentId, isExcused) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], isExcused },
    }));
  };

  const handleLateMinutesChange = (studentId, minutes) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], lateMinutes: minutes, status: minutes > 0 ? 'LATE' : 'PRESENT' },
    }));
  };

  const saveAttendance = async () => {
    if (!canManage) return;
    setSaving(true);
    setError(null);
    try {
      const payloads = Object.entries(attendanceData)
        .filter(([_, data]) => data.recordedBy === undefined || data.recordedBy === null)
        .map(([studentId, data]) => ({
          studentId: Number(studentId),
          date: selectedDate,
          status: data.status,
          attendanceType: 'DAILY',
          classGroupId: Number(selectedClassGroup),
          lateMinutes: data.lateMinutes || 0,
          isExcused: data.isExcused || false,
          notes: data.notes || null,
        }));

      if (payloads.length === 0) {
        setSaving(false);
        return;
      }

      await http.post('/attendance/bulk', payloads);
      loadAttendanceForClass();
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  const getAttendanceStats = () => {
    const values = Object.values(attendanceData);
    const total = values.length;
    const present = values.filter((v) => v.status === 'PRESENT').length;
    const absent = values.filter((v) => v.status === 'ABSENT').length;
    const late = values.filter((v) => v.status === 'LATE').length;
    const excused = values.filter((v) => v.isExcused).length;
    return { total, present, absent, late, excused };
  };

  const stats = getAttendanceStats();

  const filteredStudents = students.filter((s) => s.className === selectedClassGroup);

  const getStudentName = (studentId) => {
    const s = students.find((st) => st.id === studentId);
    return s ? `${s.firstName} ${s.lastName}` : `#${studentId}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Daily attendance tracking and management
        </p>
      </div>

      {/* Controls */}
      <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <label className="block">
            <span className="text-sm text-slate-700 dark:text-slate-200">Date</span>
            <input
              type="date"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 transition-all duration-300 focus:border-primary-500"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-700 dark:text-slate-200">Class Group</span>
            <Select
              value={selectedClassGroup}
              onChange={(e) => setSelectedClassGroup(e.target.value)}
            >
              <option value="">Select class</option>
              {classGroups.map((cg) => (
                <option key={cg.id} value={String(cg.id)}>
                  {cg.name} - {cg.level}
                </option>
              ))}
            </Select>
          </label>

          <Button
            onClick={saveAttendance}
            disabled={!canManage || saving}
            className="w-full sm:w-auto"
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="rounded-xl bg-primary-50/80 dark:bg-primary-900/20 p-3">
            <div className="text-xs text-slate-600 dark:text-slate-400">Total</div>
            <div className="text-lg font-bold text-primary-700 dark:text-primary-300">{stats.total}</div>
          </div>
          <div className="rounded-xl bg-green-50/80 dark:bg-green-900/20 p-3">
            <div className="text-xs text-slate-600 dark:text-slate-400">Present</div>
            <div className="text-lg font-bold text-green-700 dark:text-green-300">{stats.present}</div>
          </div>
          <div className="rounded-xl bg-red-50/80 dark:bg-red-900/20 p-3">
            <div className="text-xs text-slate-600 dark:text-slate-400">Absent</div>
            <div className="text-lg font-bold text-red-700 dark:text-red-300">{stats.absent}</div>
          </div>
          <div className="rounded-xl bg-yellow-50/80 dark:bg-yellow-900/20 p-3">
            <div className="text-xs text-slate-600 dark:text-slate-400">Late</div>
            <div className="text-lg font-bold text-yellow-700 dark:text-yellow-300">{stats.late}</div>
          </div>
          <div className="rounded-xl bg-blue-50/80 dark:bg-blue-900/20 p-3">
            <div className="text-xs text-slate-600 dark:text-slate-400">Excused</div>
            <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{stats.excused}</div>
          </div>
        </div>
      </div>

      {error && <div className="text-rose-600 text-sm">{error}</div>}

      {/* Attendance Table */}
      {loading ? (
        <div className="text-sm text-slate-600 dark:text-slate-300">Loading...</div>
      ) : selectedClassGroup ? (
        <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gradient-to-r from-primary-50/50 to-accent-50/50 dark:from-slate-800/50 dark:to-slate-700/50 border-b border-white/30 dark:border-slate-700/30">
              <tr>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Student</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Status</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Late (min)</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Excused</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const record = attendanceData[student.id] || {
                  status: 'PRESENT',
                  isExcused: false,
                  lateMinutes: 0,
                };
                return (
                  <tr
                    key={student.id}
                    className="transition-all duration-300 hover:bg-primary-50/50 dark:hover:bg-slate-800/50 border-b border-white/20 dark:border-slate-700/20 last:border-0"
                  >
                  <td className="p-4 text-slate-700 dark:text-slate-200">
                    {getStudentName(student.id)}
                  </td>
                    <td className="p-4">
                      <div className="flex gap-2 flex-wrap">
                        {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map((status) => (
                          <label
                            key={status}
                            className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              record.status === status
                                ? status === 'PRESENT'
                                  ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700'
                                : status === 'ABSENT'
                                ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700'
                                : status === 'LATE'
                                ? 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700'
                                : 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700'
                                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`status-${student.id}`}
                              value={status}
                              checked={record.status === status}
                              onChange={() => handleStatusChange(student.id, status)}
                              className="sr-only"
                            />
                            {status}
                          </label>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      {record.status === 'LATE' && canManage ? (
                        <input
                          type="number"
                          min="0"
                          max="120"
                          className="w-20 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100"
                          value={record.lateMinutes || 0}
                          onChange={(e) => handleLateMinutesChange(student.id, Number(e.target.value))}
                        />
                      ) : (
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {record.lateMinutes || '-'} min
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {canManage && (
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={record.isExcused}
                            onChange={(e) => handleExcusedChange(student.id, e.target.checked)}
                            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-200">Yes</span>
                        </label>
                      )}
                      {!canManage && record.isExcused && <span className="text-sm text-blue-600">Excused</span>}
                    </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr>
                  <td className="p-4 text-slate-600 dark:text-slate-400 text-center" colSpan={4}>
                    No students in this class.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 p-8 text-center">
          <p className="text-slate-600 dark:text-slate-300">
            Select a class group and date to view and manage attendance.
          </p>
        </div>
      )}
    </div>
  );
}
