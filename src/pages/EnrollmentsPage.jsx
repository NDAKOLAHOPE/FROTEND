import { useEffect, useState } from 'react';
import { http } from '../api/http.js';
import { useAuth } from '../auth/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import Select from '../components/ui/Select.jsx';

export default function EnrollmentsPage() {
  const { role } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [classGroups, setClassGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const canManage = role === 'ADMIN' || role === 'TEACHER';

  const [form, setForm] = useState({
    studentId: '',
    academicYearId: '',
    classGroupId: '',
    enrollmentType: 'NEW',
    tuitionFee: '',
    paymentStatus: 'UNPAID',
    status: 'CONFIRMED',
    notes: '',
  });

  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');

  const reloadEnrollments = async () => {
    let url = '/enrollments';
    if (selectedAcademicYear) {
      url += `?academicYearId=${selectedAcademicYear}`;
    }
    const res = await http.get(url);
    setEnrollments(res.data);
  };

  const reloadStudents = async () => {
    const res = await http.get('/students');
    setStudents(res.data);
  };

  const reloadAcademicYears = async () => {
    const res = await http.get('/academic-years');
    setAcademicYears(res.data);
  };

  const reloadClassGroups = async () => {
    if (form.academicYearId) {
      const res = await http.get(`/class-groups?academicYearId=${form.academicYearId}`);
      setClassGroups(res.data);
    } else {
      setClassGroups([]);
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        await Promise.all([reloadEnrollments(), reloadStudents(), reloadAcademicYears()]);
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.message ?? e?.message ?? 'Erreur');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [selectedAcademicYear]);

  useEffect(() => {
    if (form.academicYearId) {
      reloadClassGroups();
    }
  }, [form.academicYearId]);

  const submitCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        studentId: Number(form.studentId),
        academicYearId: Number(form.academicYearId),
        classGroupId: form.classGroupId ? Number(form.classGroupId) : null,
        enrollmentType: form.enrollmentType,
        tuitionFee: form.tuitionFee ? Number(form.tuitionFee) : null,
        paymentStatus: form.paymentStatus,
        status: form.status,
        notes: form.notes || null,
      };
      if (editingId) {
        await http.patch(`/enrollments/${editingId}`, payload);
      } else {
        await http.post('/enrollments', payload);
      }
      setForm({
        studentId: '',
        academicYearId: '',
        classGroupId: '',
        enrollmentType: 'NEW',
        tuitionFee: '',
        paymentStatus: 'UNPAID',
        status: 'CONFIRMED',
        notes: '',
      });
      setEditingId(null);
      await reloadEnrollments();
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Erreur');
    }
  };

  const startEdit = (enrollment) => {
    setEditingId(enrollment.id);
    setForm({
      studentId: String(enrollment.studentId),
      academicYearId: String(enrollment.academicYearId),
      classGroupId: enrollment.classGroupId ? String(enrollment.classGroupId) : '',
      enrollmentType: enrollment.enrollmentType || 'NEW',
      tuitionFee: enrollment.tuitionFee ? String(enrollment.tuitionFee) : '',
      paymentStatus: enrollment.paymentStatus || 'UNPAID',
      status: enrollment.status || 'CONFIRMED',
      notes: enrollment.notes || '',
    });
  };

  const removeEnrollment = async (id) => {
    try {
      await http.delete(`/enrollments/${id}`);
      await reloadEnrollments();
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Erreur');
    }
  };

  const getStudentName = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : `#${studentId}`;
  };

  const getClassName = (classGroup) => {
    if (!classGroup) return '-';
    return `${classGroup.name} (${classGroup.level})`;
  };

  const getAcademicYearName = (ay) => {
    return ay?.name || `Year ${ay?.id}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Enrollments</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Student registrations and class assignments
        </p>
      </div>

      {canManage && (
        <form
          onSubmit={submitCreate}
          className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 p-5 transition-all duration-300 hover:shadow-xl"
        >
          <div className="text-sm font-semibold mb-4 text-slate-900 dark:text-white">
            {editingId ? 'Update enrollment' : 'Create enrollment'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Student</span>
              <Select
                value={form.studentId}
                onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}
                required
              >
                <option value="">Select student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName}
                  </option>
                ))}
              </Select>
            </label>

            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Academic Year</span>
              <Select
                value={form.academicYearId}
                onChange={(e) => setForm((f) => ({ ...f, academicYearId: e.target.value }))}
                required
              >
                <option value="">Select academic year</option>
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    {ay.name} {ay.isCurrent ? '(Current)' : ''}
                  </option>
                ))}
              </Select>
            </label>

            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Class Group</span>
              <Select
                value={form.classGroupId}
                onChange={(e) => setForm((f) => ({ ...f, classGroupId: e.target.value }))}
              >
                <option value="">Select class (optional)</option>
                {classGroups.map((cg) => (
                  <option key={cg.id} value={cg.id}>
                    {cg.name} - {cg.level}
                  </option>
                ))}
              </Select>
            </label>

            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Type</span>
              <Select
                value={form.enrollmentType}
                onChange={(e) => setForm((f) => ({ ...f, enrollmentType: e.target.value }))}
              >
                <option value="NEW">New</option>
                <option value="RETURNING">Returning</option>
                <option value="TRANSFER">Transfer</option>
                <option value="EXCHANGE">Exchange</option>
              </Select>
            </label>

            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Tuition Fee</span>
              <input
                type="number"
                step="0.01"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 transition-all duration-300 focus:border-primary-500"
                value={form.tuitionFee}
                onChange={(e) => setForm((f) => ({ ...f, tuitionFee: e.target.value }))}
                placeholder="0.00"
              />
            </label>

            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Payment Status</span>
              <Select
                value={form.paymentStatus}
                onChange={(e) => setForm((f) => ({ ...f, paymentStatus: e.target.value }))}
              >
                <option value="UNPAID">Unpaid</option>
                <option value="PARTIAL">Partial</option>
                <option value="PAID">Paid</option>
                <option value="EXEMPT">Exempt</option>
              </Select>
            </label>

            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Status</span>
              <Select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
              </Select>
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm text-slate-700 dark:text-slate-200">Notes</span>
              <input
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 transition-all duration-300 focus:border-primary-500"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Optional notes"
              />
            </label>
          </div>
          <div className="mt-5 flex gap-2">
            <Button type="submit">{editingId ? 'Update enrollment' : 'Create enrollment'}</Button>
            {editingId && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditingId(null);
                  setForm({
                    studentId: '',
                    academicYearId: '',
                    classGroupId: '',
                    enrollmentType: 'NEW',
                    tuitionFee: '',
                    paymentStatus: 'UNPAID',
                    status: 'CONFIRMED',
                    notes: '',
                  });
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}

      {error && <div className="text-rose-600 text-sm">{error}</div>}

      {/* Filter controls */}
      <div className="flex gap-2">
        <label className="block">
          <span className="text-sm text-slate-700 dark:text-slate-200">Filter by Academic Year:</span>
          <Select
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
          >
            <option value="">All Years</option>
            {academicYears.map((ay) => (
              <option key={ay.id} value={ay.id}>
                {ay.name}
              </option>
            ))}
          </Select>
        </label>
      </div>

      {loading ? (
        <div className="text-sm text-slate-600 dark:text-slate-300">Loading...</div>
      ) : (
        <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 overflow-hidden transition-all duration-300 hover:shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-gradient-to-r from-primary-50/50 to-accent-50/50 dark:from-slate-800/50 dark:to-slate-700/50 border-b border-white/30 dark:border-slate-700/30">
              <tr>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">ID</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Student</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Academic Year</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Class</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Type</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Payment</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Status</th>
                {canManage && <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.id} className="transition-all duration-300 hover:bg-primary-50/50 dark:hover:bg-slate-800/50 border-b border-white/20 dark:border-slate-700/20 last:border-0">
                  <td className="p-4 font-medium text-slate-900 dark:text-slate-100">{e.id}</td>
                  <td className="p-4 text-slate-700 dark:text-slate-200">
                    {getStudentName(e.studentId)}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{getAcademicYearName(e.academicYear)}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {e.classGroup ? getClassName(e.classGroup) : '-'}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300 capitalize">{e.enrollmentType}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300 capitalize">{e.paymentStatus}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        e.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : e.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : e.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {e.status}
                    </span>
                  </td>
                  {canManage && (
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button type="button" className="px-3 py-1.5 text-xs" onClick={() => startEdit(e)}>
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => removeEnrollment(e.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {enrollments.length === 0 && (
                <tr>
                  <td
                    className="p-4 text-slate-600 dark:text-slate-400 text-center"
                    colSpan={canManage ? 8 : 7}
                  >
                    No enrollments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
