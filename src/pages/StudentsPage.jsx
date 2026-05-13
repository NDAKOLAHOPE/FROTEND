import { useEffect, useState } from 'react';
import { http } from '../api/http.js';
import { useAuth } from '../auth/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import Select from '../components/ui/Select.jsx';
import Card from '../components/ui/Card.jsx';

export default function StudentsPage() {
  const { role } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [academicYears, setAcademicYears] = useState([]);

  const canManage = role === 'ADMIN' || role === 'TEACHER';

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    className: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    nationality: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalInfo: '',
    studentIdNumber: '',
    status: 'ACTIVE',
    photoUrl: '',
  });

  const [parents, setParents] = useState([]);
  const [assignParentStudentId, setAssignParentStudentId] = useState('');
  const [assignParentParentId, setAssignParentParentId] = useState('');

  const studentsUrl = role === 'PARENT' ? '/students/my' : '/students';

  const reloadStudents = async () => {
    const res = await http.get(studentsUrl);
    setStudents(res.data);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await http.get(studentsUrl);
        if (!alive) return;
        setStudents(res.data);
        // Also load academic years for enrollment
        const yearsRes = await http.get('/academic-years');
        setAcademicYears(yearsRes.data);
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
  }, [studentsUrl]);

  useEffect(() => {
    if (canManage) {
      (async () => {
        try {
          const res = await http.get('/users');
          setParents(
            res.data.filter(
              (u) => u.role === 'PARENT' || u.role === 'MERE' || u.role === 'mere' || u.role === 'parent',
            ),
          );
        } catch {
          // ignore
        }
      })();
    }
  }, [canManage]);

  const submitCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      // Remove empty optional fields
      Object.keys(payload).forEach((key) => payload[key] === '' && delete payload[key]);
      if (editingStudentId) {
        await http.patch(`/students/${editingStudentId}`, payload);
      } else {
        await http.post('/students', payload);
      }
      resetForm();
      await reloadStudents();
    } catch (e2) {
      setError(e2?.response?.data?.message ?? e2?.message ?? 'Erreur');
    }
  };

  const resetForm = () => {
    setEditingStudentId(null);
    setForm({
      firstName: '',
      lastName: '',
      dob: '',
      gender: '',
      className: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      nationality: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      medicalInfo: '',
      studentIdNumber: '',
      status: 'ACTIVE',
      photoUrl: '',
    });
  };

  const startEditStudent = (student) => {
    setEditingStudentId(student.id);
    setForm({
      firstName: student.firstName ?? '',
      lastName: student.lastName ?? '',
      dob: student.dob ? new Date(student.dob).toISOString().slice(0, 10) : '',
      gender: student.gender ?? '',
      className: student.className ?? '',
      email: student.email ?? '',
      phone: student.phone ?? '',
      address: student.address ?? '',
      city: student.city ?? '',
      postalCode: student.postalCode ?? '',
      country: student.country ?? '',
      nationality: student.nationality ?? '',
      emergencyContactName: student.emergencyContactName ?? '',
      emergencyContactPhone: student.emergencyContactPhone ?? '',
      medicalInfo: student.medicalInfo ?? '',
      studentIdNumber: student.studentIdNumber ?? '',
      status: student.status ?? 'ACTIVE',
      photoUrl: student.photoUrl ?? '',
    });
  };

  const removeStudent = async (id) => {
    try {
      await http.delete(`/students/${id}`);
      await reloadStudents();
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Erreur');
    }
  };

  const viewStudentDetails = async (student) => {
    try {
      const res = await http.get(`/students/${student.id}`);
      setSelectedStudent(res.data);
      setShowDetailDialog(true);
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Erreur');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'INACTIVE':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
      case 'GRADUATED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'TRANSFERRED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getGenderLabel = (gender) => {
    switch (gender) {
      case 'MALE':
        return '♂️ Male';
      case 'FEMALE':
        return '♀️ Female';
      case 'OTHER':
        return '⚧ Other';
      default:
        return '-';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Students</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Complete student management with profiles, contacts, and history
        </p>
      </div>

      {canManage && (
        <form
          onSubmit={submitCreate}
          className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 p-5 transition-all duration-300 hover:shadow-xl"
        >
          <div className="text-sm font-semibold mb-4 text-slate-900 dark:text-white">
            {editingStudentId ? 'Update student' : 'Create student'}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">First name *</span>
              <input
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 transition-all duration-300 focus:border-primary-500"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                required
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Last name *</span>
              <input
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 transition-all duration-300 focus:border-primary-500"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                required
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Date of Birth</span>
              <input
                type="date"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 transition-all duration-300 focus:border-primary-500"
                value={form.dob}
                onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Gender</span>
              <Select
                value={form.gender}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
              >
                <option value="">Select</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </Select>
            </label>
          </div>

          {/* Contact & Class */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Email</span>
              <input
                type="email"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 transition-all duration-300 focus:border-primary-500"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Phone</span>
              <input
                type="tel"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 transition-all duration-300 focus:border-primary-500"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Class</span>
              <input
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 transition-all duration-300 focus:border-primary-500"
                value={form.className}
                onChange={(e) => setForm((f) => ({ ...f, className: e.target.value }))}
                placeholder="e.g. 6A"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Student ID</span>
              <input
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 transition-all duration-300 focus:border-primary-500"
                value={form.studentIdNumber}
                onChange={(e) => setForm((f) => ({ ...f, studentIdNumber: e.target.value }))}
                placeholder="School ID"
              />
            </label>
          </div>

          {/* Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <label className="block sm:col-span-2">
              <span className="text-sm text-slate-700 dark:text-slate-200">Address</span>
              <input
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 transition-all duration-300 focus:border-primary-500"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">City</span>
              <input
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 transition-all duration-300 focus:border-primary-500"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Postal Code</span>
              <input
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 transition-all duration-300 focus:border-primary-500"
                value={form.postalCode}
                onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
              />
            </label>
          </div>

          {/* Nationality & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Country</span>
              <input
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 transition-all duration-300 focus:border-primary-500"
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Nationality</span>
              <input
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 transition-all duration-300 focus:border-primary-500"
                value={form.nationality}
                onChange={(e) => setForm((f) => ({ ...f, nationality: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Status</span>
              <Select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="GRADUATED">Graduated</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="TRANSFERRED">Transferred</option>
              </Select>
            </label>
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Photo URL</span>
              <input
                type="url"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 transition-all duration-300 focus:border-primary-500"
                value={form.photoUrl}
                onChange={(e) => setForm((f) => ({ ...f, photoUrl: e.target.value }))}
                placeholder="https://..."
              />
            </label>
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Emergency Contact Name</span>
              <input
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 transition-all duration-300 focus:border-primary-500"
                value={form.emergencyContactName}
                onChange={(e) => setForm((f) => ({ ...f, emergencyContactName: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Emergency Contact Phone</span>
              <input
                type="tel"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 transition-all duration-300 focus:border-primary-500"
                value={form.emergencyContactPhone}
                onChange={(e) => setForm((f) => ({ ...f, emergencyContactPhone: e.target.value }))}
              />
            </label>
          </div>

          {/* Medical Info */}
          <div className="mb-4">
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Medical Information</span>
              <textarea
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 min-h-[80px] dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 transition-all duration-300 focus:border-primary-500"
                value={form.medicalInfo}
                onChange={(e) => setForm((f) => ({ ...f, medicalInfo: e.target.value }))}
                placeholder="Allergies, conditions, medications..."
              />
            </label>
          </div>

          <div className="mt-5 flex gap-2">
            <Button type="submit">{editingStudentId ? 'Update student' : 'Create student'}</Button>
            {editingStudentId && (
              <Button type="button" variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}

      {error && <div className="text-rose-600 text-sm">{error}</div>}

      {/* Students Table */}
      {loading ? (
        <div className="text-sm text-slate-600 dark:text-slate-300">Loading...</div>
      ) : (
        <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 overflow-hidden transition-all duration-300 hover:shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-gradient-to-r from-primary-50/50 to-accent-50/50 dark:from-slate-800/50 dark:to-slate-700/50 border-b border-white/30 dark:border-slate-700/30">
              <tr>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Photo</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Name</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">ID</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Gender</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Class</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Status</th>
                {canManage && <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr
                  key={s.id}
                  className="transition-all duration-300 hover:bg-primary-50/50 dark:hover:bg-slate-800/50 border-b border-white/20 dark:border-slate-700/20 last:border-0"
                >
                  <td className="p-4">
                    {s.photoUrl ? (
                      <img
                        src={s.photoUrl}
                        alt={`${s.firstName} ${s.lastName}`}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white/50"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold">
                        {s.firstName[0]}{s.lastName[0]}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-200">
                    <button
                      onClick={() => viewStudentDetails(s)}
                      className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      {s.firstName} {s.lastName}
                    </button>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                    {s.studentIdNumber || `#${s.id}`}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {getGenderLabel(s.gender)}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{s.className ?? '-'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                  {canManage && (
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => startEditStudent(s)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => viewStudentDetails(s)}
                        >
                          Details
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => removeStudent(s.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td
                    className="p-4 text-slate-600 dark:text-slate-400 text-center"
                    colSpan={canManage ? 7 : 6}
                  >
                    No students yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Parent Form */}
      {canManage && (
        <form
          onSubmit={submitAssignParent}
          className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 p-5 transition-all duration-300 hover:shadow-xl"
        >
          <div className="text-sm font-semibold mb-4 text-slate-900 dark:text-white">Assign parent to student</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Student</span>
              <Select
                value={assignParentStudentId}
                onChange={(e) => setAssignParentStudentId(e.target.value)}
                disabled={students.length === 0}
              >
                <option value="">Select a student</option>
                {students.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.firstName} {s.lastName}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Parent</span>
              <Select
                value={assignParentParentId}
                onChange={(e) => setAssignParentParentId(e.target.value)}
                disabled={parents.length === 0}
              >
                <option value="">Select a parent</option>
                {parents.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.email}
                  </option>
                ))}
              </Select>
            </label>
          </div>
          <div className="mt-5">
            <Button type="submit" disabled={!assignParentStudentId || !assignParentParentId}>
              Assign parent
            </Button>
          </div>
        </form>
      )}

      {/* Student Detail Dialog */}
      {showDetailDialog && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Student Profile</h3>
              <button
                onClick={() => setShowDetailDialog(false)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="flex items-start gap-6 mb-6">
                {selectedStudent.photoUrl ? (
                  <img
                    src={selectedStudent.photoUrl}
                    alt={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-primary-100 dark:ring-primary-900"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-primary-100 dark:ring-primary-900">
                    {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </h2>
                  <div className="text-slate-600 dark:text-slate-300">
                    ID: {selectedStudent.studentIdNumber || `#${selectedStudent.id}`}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedStudent.status)}`}>
                      {selectedStudent.status}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                      Class: {selectedStudent.className || 'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Personal Information</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-slate-600 dark:text-slate-400">Full Name</dt>
                      <dd className="text-slate-900 dark:text-white">
                        {selectedStudent.firstName} {selectedStudent.lastName}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-600 dark:text-slate-400">Date of Birth</dt>
                      <dd className="text-slate-900 dark:text-white">
                        {selectedStudent.dob ? new Date(selectedStudent.dob).toLocaleDateString() : '-'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-600 dark:text-slate-400">Gender</dt>
                      <dd className="text-slate-900 dark:text-white">{getGenderLabel(selectedStudent.gender)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-600 dark:text-slate-400">Nationality</dt>
                      <dd className="text-slate-900 dark:text-white">{selectedStudent.nationality || '-'}</dd>
                    </div>
                  </dl>
                </div>

                {/* Contact Info */}
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Contact Information</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-slate-600 dark:text-slate-400">Email</dt>
                      <dd className="text-slate-900 dark:text-white">{selectedStudent.email || '-'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-600 dark:text-slate-400">Phone</dt>
                      <dd className="text-slate-900 dark:text-white">{selectedStudent.phone || '-'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-600 dark:text-slate-400">Address</dt>
                      <dd className="text-slate-900 dark:text-white max-w-[200px]">
                        {selectedStudent.address
                          ? `${selectedStudent.address}, ${selectedStudent.city || ''} ${selectedStudent.postalCode || ''}`
                          : '-'}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Emergency Contact</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-slate-600 dark:text-slate-400">Name</dt>
                      <dd className="text-slate-900 dark:text-white">
                        {selectedStudent.emergencyContactName || '-'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-600 dark:text-slate-400">Phone</dt>
                      <dd className="text-slate-900 dark:text-white">
                        {selectedStudent.emergencyContactPhone || '-'}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Medical */}
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Medical Information</h4>
                  <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                    {selectedStudent.medicalInfo || 'No medical information recorded.'}
                  </p>
                </div>
              </div>

              {/* Parents Section */}
              {selectedStudent.studentParents && selectedStudent.studentParents.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Parents / Guardians</h4>
                  <div className="space-y-2">
                    {selectedStudent.studentParents.map((sp) => (
                      <Card key={sp.parentId} className="p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {sp.parent?.email || `Parent #${sp.parentId}`}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              Role: {sp.parent?.role || 'Parent'}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* History */}
              <div className="mt-6 text-sm text-slate-600 dark:text-slate-400">
                <div>Created: {new Date(selectedStudent.createdAt).toLocaleString()}</div>
                <div>Last updated: {new Date(selectedStudent.updatedAt).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
