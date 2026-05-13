import { useEffect, useState } from 'react';
import { http } from '../api/http.js';
import { useAuth } from '../auth/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import Select from '../components/ui/Select.jsx';
import Card from '../components/ui/Card.jsx';

export default function ExamsPage() {
  const { role } = useAuth();
  const [exams, setExams] = useState([]);
  const [classGroups, setClassGroups] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examScores, setExamScores] = useState([]);
  const [students, setStudents] = useState([]);
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [scoreForm, setScoreForm] = useState({ studentId: '', score: '', comments: '' });

  const canManage = role === 'ADMIN' || role === 'TEACHER';

  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: '',
    examType: 'WRITTEN',
    classGroupId: '',
    academicYearId: '',
    examDate: '',
    startTime: '',
    endTime: '',
    durationMinutes: '',
    maxScore: 20,
    passingScore: 10,
    weight: 1,
    coefficient: 1,
    status: 'DRAFT',
    instructions: '',
    location: '',
  });

  const [selectedClassGroup, setSelectedClassGroup] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [examsRes, classesRes, yearsRes, studentsRes] = await Promise.all([
        http.get('/exams'),
        http.get('/class-groups'),
        http.get('/academic-years'),
        http.get('/students'),
      ]);
      setExams(examsRes.data);
      setClassGroups(classesRes.data);
      setAcademicYears(yearsRes.data);
      setStudents(studentsRes.data);
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const loadExamScores = async (examId) => {
    try {
      const res = await http.get(`/exams/${examId}/scores`);
      setExamScores(res.data);
      setSelectedExam(examId);
      setShowScoreDialog(true);
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Error loading scores');
    }
  };

   const submitCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        classGroupId: Number(form.classGroupId),
        academicYearId: form.academicYearId ? Number(form.academicYearId) : null,
        examDate: form.examDate,
        maxScore: Number(form.maxScore),
        passingScore: form.passingScore ? Number(form.passingScore) : null,
        weight: Number(form.weight),
        coefficient: Number(form.coefficient),
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : null,
      };
      if (editingId) {
        await http.patch(`/exams/${editingId}`, payload);
      } else {
        await http.post('/exams', payload);
      }
      resetForm();
      loadData();
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Erreur');
    }
  };

  const startEdit = (exam) => {
    setEditingId(exam.id);
    setForm({
      title: exam.title,
      description: exam.description || '',
      subject: exam.subject,
      examType: exam.examType,
      classGroupId: String(exam.classGroupId),
      academicYearId: exam.academicYearId ? String(exam.academicYearId) : '',
      examDate: exam.examDate?.slice(0, 10) || '',
      startTime: exam.startTime?.slice(0, 16) || '',
      endTime: exam.endTime?.slice(0, 16) || '',
      durationMinutes: exam.durationMinutes ? String(exam.durationMinutes) : '',
      maxScore: exam.maxScore,
      passingScore: exam.passingScore || '',
      weight: exam.weight,
      coefficient: exam.coefficient,
      status: exam.status,
      instructions: exam.instructions || '',
      location: exam.location || '',
    });
  };

  const removeExam = async (id) => {
    try {
      await http.delete(`/exams/${id}`);
      loadData();
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Erreur');
    }
  };

  const publishExam = async (id) => {
    try {
      await http.post(`/exams/${id}/publish`);
      loadData();
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Erreur');
    }
  };

  const recordScore = async (e) => {
    e.preventDefault();
    try {
      await http.post(`/exams/${selectedExam}/score`, {
        studentId: Number(scoreForm.studentId),
        score: Number(scoreForm.score),
        comments: scoreForm.comments,
      });
      setScoreForm({ studentId: '', score: '', comments: '' });
      loadExamScores(selectedExam);
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Erreur');
    }
  };

  const bulkRecordScores = async (scores) => {
    try {
      await http.post(`/exams/${selectedExam}/scores/bulk`, scores);
      loadExamScores(selectedExam);
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Erreur');
    }
  };

  const getClassGroupName = (cg) => {
    return `${cg.name} - ${cg.level}`;
  };

  const getStudentName = (studentId) => {
    const s = students.find((st) => st.id === studentId);
    return s ? `${s.firstName} ${s.lastName}` : `#${studentId}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'DRAFT':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: '',
      description: '',
      subject: '',
      examType: 'WRITTEN',
      classGroupId: '',
      academicYearId: '',
      examDate: '',
      startTime: '',
      endTime: '',
      durationMinutes: '',
      maxScore: 20,
      passingScore: 10,
      weight: 1,
      coefficient: 1,
      status: 'DRAFT',
      instructions: '',
      location: '',
    });
  };

  const filteredExams = exams.filter((exam) => {
    if (selectedClassGroup && exam.classGroupId !== Number(selectedClassGroup)) return false;
    if (filterSubject && exam.subject !== filterSubject) return false;
    return true;
  });

  const subjects = [...new Set(exams.map((e) => e.subject))];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Exams</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Create and manage exams, record scores, track results
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={selectedClassGroup} onChange={(e) => setSelectedClassGroup(e.target.value)}>
          <option value="">All Classes</option>
          {classGroups.map((cg) => (
            <option key={cg.id} value={cg.id}>
              {cg.name} - {cg.level}
            </option>
          ))}
        </Select>
        <Select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>

      {canManage && (
        <form
          onSubmit={submitCreate}
          className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 p-5 transition-all duration-300 hover:shadow-xl"
        >
          <div className="text-sm font-semibold mb-4 text-slate-900 dark:text-white">
            {editingId ? 'Update exam' : 'Create new exam'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Title</span>
              <input
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Subject</span>
              <input
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                required
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Class Group</span>
              <Select
                value={form.classGroupId}
                onChange={(e) => setForm((f) => ({ ...f, classGroupId: e.target.value }))}
                required
              >
                <option value="">Select class</option>
                {classGroups.map((cg) => (
                  <option key={cg.id} value={cg.id}>
                    {cg.name} - {cg.level}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Exam Date</span>
              <input
                type="date"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100"
                value={form.examDate}
                onChange={(e) => setForm((f) => ({ ...f, examDate: e.target.value }))}
                required
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Type</span>
              <Select
                value={form.examType}
                onChange={(e) => setForm((f) => ({ ...f, examType: e.target.value }))}
              >
                <option value="WRITTEN">Written</option>
                <option value="ORAL">Oral</option>
                <option value="PRACTICAL">Practical</option>
                <option value="PROJECT">Project</option>
                <option value="QUIZ">Quiz</option>
                <option value="MIDTERM">Midterm</option>
                <option value="FINAL">Final</option>
              </Select>
            </label>
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Max Score</span>
              <input
                type="number"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100"
                value={form.maxScore}
                onChange={(e) => setForm((f) => ({ ...f, maxScore: Number(e.target.value) }))}
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Coefficient</span>
              <input
                type="number"
                step="0.1"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100"
                value={form.coefficient}
                onChange={(e) => setForm((f) => ({ ...f, coefficient: Number(e.target.value) }))}
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Status</span>
              <Select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="PUBLISHED">Published</option>
                <option value="CANCELLED">Cancelled</option>
              </Select>
            </label>
          </div>
          <div className="mt-5 flex gap-2">
            <Button type="submit">{editingId ? 'Update exam' : 'Create exam'}</Button>
            {editingId && (
              <Button type="button" variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}

      {error && <div className="text-rose-600 text-sm">{error}</div>}

      {/* Exams List */}
      {loading ? (
        <div className="text-sm text-slate-600 dark:text-slate-300">Loading...</div>
      ) : (
        <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 overflow-hidden transition-all duration-300 hover:shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-gradient-to-r from-primary-50/50 to-accent-50/50 dark:from-slate-800/50 dark:to-slate-700/50 border-b border-white/30 dark:border-slate-700/30">
              <tr>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Title</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Subject</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Class</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Date</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Max</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Coef</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Status</th>
                {canManage && <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredExams.map((exam) => (
                <tr
                  key={exam.id}
                  className="transition-all duration-300 hover:bg-primary-50/50 dark:hover:bg-slate-800/50 border-b border-white/20 dark:border-slate-700/20 last:border-0"
                >
                  <td className="p-4 font-medium text-slate-900 dark:text-slate-100">{exam.title}</td>
                  <td className="p-4 text-slate-700 dark:text-slate-200">{exam.subject}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {getClassGroupName(exam.classGroup)}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {exam.examDate?.slice(0, 10) || '-'}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{exam.maxScore}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{exam.coefficient}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                      {exam.status}
                    </span>
                  </td>
                  {canManage && (
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => loadExamScores(exam.id)}
                        >
                          Scores
                        </Button>
                        {exam.status !== 'PUBLISHED' && (
                          <Button
                            type="button"
                            variant="secondary"
                            className="px-3 py-1.5 text-xs"
                            onClick={() => startEdit(exam)}
                          >
                            Edit
                          </Button>
                        )}
                        {exam.status !== 'PUBLISHED' && (
                          <Button
                            type="button"
                            variant="success"
                            className="px-3 py-1.5 text-xs"
                            onClick={() => publishExam(exam.id)}
                          >
                            Publish
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="danger"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => removeExam(exam.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredExams.length === 0 && (
                <tr>
                  <td className="p-4 text-slate-600 dark:text-slate-400 text-center" colSpan={canManage ? 8 : 7}>
                    No exams found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Score Recording Dialog */}
      {showScoreDialog && selectedExam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Record Scores</h3>
              <button
                onClick={() => setShowScoreDialog(false)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[60vh]">
              <div className="mb-4">
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">Quick Stats</h4>
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-3">
                    <div className="text-sm text-slate-600 dark:text-slate-400">Total Students</div>
                    <div className="text-xl font-bold text-primary-600">
                      {examScores.length}
                    </div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-sm text-slate-600 dark:text-slate-400">Graded</div>
                    <div className="text-xl font-bold text-green-600">
                      {examScores.filter((s) => s.status === 'GRADED').length}
                    </div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-sm text-slate-600 dark:text-slate-400">Avg Score</div>
                    <div className="text-xl font-bold text-blue-600">
                      {examScores.length > 0
                        ? (
                            examScores.reduce((acc, s) => acc + (Number(s.percentage) || 0), 0) /
                            examScores.length
                          ).toFixed(1)
                        : 0}
                      %
                    </div>
                  </Card>
                </div>
              </div>

              {/* Score List */}
              <div className="space-y-2">
                <h4 className="font-medium text-slate-900 dark:text-white">Student Scores</h4>
                {examScores.map((score) => (
                  <div
                    key={score.id}
                    className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 flex items-center gap-4"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {getStudentName(score.studentId)}
                      </div>
                      {score.comments && (
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {score.comments}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="w-20 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                        value={score.score ?? ''}
                        onChange={async (e) => {
                          const newScore = Number(e.target.value);
                          try {
                            await http.patch(`/exams/${selectedExam}/score`, {
                              studentId: score.studentId,
                              score: newScore,
                            });
                            loadExamScores(selectedExam);
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        placeholder="Score"
                      />
                      <span className="text-sm text-slate-500">/ {score.maxPossible}</span>
                    </div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {score.gradeLetter || '-'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
