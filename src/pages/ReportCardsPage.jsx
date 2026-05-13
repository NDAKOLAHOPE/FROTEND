import { useEffect, useState } from 'react';
import { http } from '../api/http.js';
import { useAuth } from '../auth/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import Select from '../components/ui/Select.jsx';
import Card from '../components/ui/Card.jsx';

export default function ReportCardsPage() {
  const { role } = useAuth();
  const [reportCards, setReportCards] = useState([]);
  const [students, setStudents] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [classGroups, setClassGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReportCard, setSelectedReportCard] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    academicYearId: '',
    classGroupId: '',
    term: 'T1',
  });
  const [statistics, setStatistics] = useState(null);

  const canManage = role === 'ADMIN' || role === 'TEACHER';
  const canView = canManage || role === 'PARENT' || role === 'STUDENT';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rcRes, studentsRes, yearsRes, classesRes, statsRes] = await Promise.all([
        http.get('/report-cards'),
        http.get('/students'),
        http.get('/academic-years'),
        http.get('/class-groups'),
        http.get('/report-cards/statistics'),
      ]);
      setReportCards(rcRes.data);
      setStudents(studentsRes.data);
      setAcademicYears(yearsRes.data);
      setClassGroups(classesRes.data);
      setStatistics(statsRes.data);
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const generateReportCards = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        academicYearId: Number(generateForm.academicYearId),
        classGroupId: generateForm.classGroupId ? Number(generateForm.classGroupId) : null,
        term: generateForm.term,
        generatedBy: 1, // current user id (to be implemented)
      };
      const res = await http.post('/report-cards/generate', payload);
      setReportCards(res.data.reportCards);
      setShowGenerateDialog(false);
      loadData();
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Error generating report cards');
    }
  };

  const publishReportCard = async (id) => {
    try {
      await http.patch(`/report-cards/${id}/publish`);
      loadData();
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Error publishing');
    }
  };

  const startEdit = (reportCard) => {
    // Set editing state if needed
    // Could open a dialog with form
  };

  const saveEdit = async (id, updates) => {
    try {
      await http.patch(`/report-cards/${id}`, updates);
      loadData();
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Error updating');
    }
  };

  const viewDetails = async (id) => {
    try {
      const res = await http.get(`/report-cards/${id}`);
      setSelectedReportCard(res.data);
      setShowDetailDialog(true);
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Error loading details');
    }
  };

  const getStudentName = (studentId) => {
    const s = students.find((st) => st.id === studentId);
    return s ? `${s.firstName} ${s.lastName}` : `#${studentId}`;
  };

  const getAcademicYearName = (ayId) => {
    const ay = academicYears.find((y) => y.id === ayId);
    return ay?.name || `Year ${ayId}`;
  };

  const getClassName = (classGroupId) => {
    const cg = classGroups.find((c) => c.id === classGroupId);
    return cg ? `${cg.name} (${cg.level})` : '-';
  };

  const getDecisionColor = (decision) => {
    switch (decision) {
      case 'PROMOTED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'RETAINED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'GRADUATED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const filteredReportCards = reportCards.filter((rc) => {
    // Could add filters based on academic year, class, student
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Report Cards</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Student academic performance reports and transcripts
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setShowGenerateDialog(true)}>Generate Report Cards</Button>
        )}
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-slate-600 dark:text-slate-400">Total Students</div>
            <div className="text-2xl font-bold text-primary-600">{statistics.totalStudents}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-slate-600 dark:text-slate-400">Pass Rate</div>
            <div className="text-2xl font-bold text-green-600">{statistics.passRate?.toFixed(1)}%</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-slate-600 dark:text-slate-400">Class Average</div>
            <div className="text-2xl font-bold text-blue-600">{statistics.classAverage?.toFixed(2)}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-slate-600 dark:text-slate-400">Promoted</div>
            <div className="text-2xl font-bold text-emerald-600">{statistics.promotedCount}</div>
          </Card>
        </div>
      )}

      {error && <div className="text-rose-600 text-sm">{error}</div>}

      {/* Report Cards Table */}
      {loading ? (
        <div className="text-sm text-slate-600 dark:text-slate-300">Loading...</div>
      ) : (
        <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 overflow-hidden transition-all duration-300 hover:shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-gradient-to-r from-primary-50/50 to-accent-50/50 dark:from-slate-800/50 dark:to-slate-700/50 border-b border-white/30 dark:border-slate-700/30">
              <tr>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Student</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Term</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Academic Year</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Average</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Rank</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Attendance</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Decision</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Status</th>
                {canManage && <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredReportCards.map((rc) => (
                <tr
                  key={rc.id}
                  className="transition-all duration-300 hover:bg-primary-50/50 dark:hover:bg-slate-800/50 border-b border-white/20 dark:border-slate-700/20 last:border-0"
                >
                  <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                    {getStudentName(rc.studentId)}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{rc.term}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {getAcademicYearName(rc.academicYearId)}
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-primary-600 dark:text-primary-400">
                      {Number(rc.average).toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-500">/{rc.maxPossible?.toFixed(0)}</span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {rc.classRank ? `#${rc.classRank}/${rc.classSize || '-'}` : '-'}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {rc.attendancePercentage?.toFixed(1)}%
                  </td>
                  <td className="p-4">
                    {rc.decision && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDecisionColor(rc.decision)}`}>
                        {rc.decision}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rc.status)}`}>
                      {rc.status}
                    </span>
                  </td>
                  {canManage && (
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => viewDetails(rc.id)}
                        >
                          View
                        </Button>
                        {rc.status !== 'PUBLISHED' && (
                          <>
                            <Button
                              type="button"
                              variant="secondary"
                              className="px-3 py-1.5 text-xs"
                              onClick={() => {/* edit logic */}}
                            >
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="success"
                              className="px-3 py-1.5 text-xs"
                              onClick={() => publishReportCard(rc.id)}
                            >
                              Publish
                            </Button>
                          </>
                         )}
                       </div>
                     </td>
                  )}
                </tr>
              ))}
              {filteredReportCards.length === 0 && (
                <tr>
                  <td
                    className="p-4 text-slate-600 dark:text-slate-400 text-center"
                    colSpan={canManage ? 10 : 9}
                  >
                    No report cards generated yet.{' '}
                    {canManage && (
                      <button
                        onClick={() => setShowGenerateDialog(true)}
                        className="text-primary-600 hover:underline ml-2"
                      >
                        Generate now
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Generate Dialog */}
      {showGenerateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Generate Report Cards
            </h3>
            <form onSubmit={generateReportCards} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1">
                  Academic Year
                </label>
                <Select
                  value={generateForm.academicYearId}
                  onChange={(e) => setGenerateForm((f) => ({ ...f, academicYearId: e.target.value }))}
                  required
                >
                  <option value="">Select academic year</option>
                  {academicYears.map((ay) => (
                    <option key={ay.id} value={ay.id}>
                      {ay.name} {ay.isCurrent ? '(Current)' : ''}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1">
                  Class Group (Optional - leave empty for all)
                </label>
                <Select
                  value={generateForm.classGroupId}
                  onChange={(e) => setGenerateForm((f) => ({ ...f, classGroupId: e.target.value }))}
                >
                  <option value="">All Classes</option>
                  {classGroups.map((cg) => (
                    <option key={cg.id} value={cg.id}>
                      {cg.name} - {cg.level}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1">
                  Term
                </label>
                <Select
                  value={generateForm.term}
                  onChange={(e) => setGenerateForm((f) => ({ ...f, term: e.target.value }))}
                >
                  <option value="T1">Term 1</option>
                  <option value="T2">Term 2</option>
                  <option value="T3">Term 3</option>
                  <option value="SEM1">Semester 1</option>
                  <option value="SEM2">Semester 2</option>
                  <option value="ANNUAL">Annual</option>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit">Generate</Button>
                <Button type="button" variant="ghost" onClick={() => setShowGenerateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      {showDetailDialog && selectedReportCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Report Card - {getStudentName(selectedReportCard.studentId)}
              </h3>
              <button
                onClick={() => setShowDetailDialog(false)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="p-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400">Average</div>
                  <div className="text-2xl font-bold text-primary-600">
                    {Number(selectedReportCard.average).toFixed(2)}
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400">Class Rank</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedReportCard.classRank ? `#${selectedReportCard.classRank}` : '-'}
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400">Attendance</div>
                  <div className="text-2xl font-bold text-green-600">
                    {selectedReportCard.attendancePercentage?.toFixed(1)}%
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400">Decision</div>
                  <div className="text-lg font-bold text-purple-600">
                    {selectedReportCard.decision || 'Pending'}
                  </div>
                </Card>
              </div>

              {selectedReportCard.teacherComments && (
                <div className="mb-4">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-2">Teacher Comments</h4>
                  <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                    {selectedReportCard.teacherComments}
                  </p>
                </div>
              )}

              {selectedReportCard.principalComments && (
                <div className="mb-4">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-2">Principal Comments</h4>
                  <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                    {selectedReportCard.principalComments}
                  </p>
                </div>
              )}

              <div className="text-sm text-slate-600 dark:text-slate-400">
                <div>Term: {selectedReportCard.term}</div>
                <div>
                  Generated: {new Date(selectedReportCard.createdAt).toLocaleDateString()}
                </div>
                {selectedReportCard.publishedAt && (
                  <div>
                    Published: {new Date(selectedReportCard.publishedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
