import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useParams, NavLink } from 'react-router';
import axiosClient from '../utils/axiosClient';

const MONACO_LANGUAGE = { javascript: 'javascript', java: 'java', cpp: 'cpp' };

const ProblemPage = () => {
  const [problem,          setProblem]          = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code,             setCode]             = useState('');
  const [pageLoading,      setPageLoading]      = useState(true);
  const [actionLoading,    setActionLoading]    = useState(false);
  const [runResult,        setRunResult]        = useState(null);
  const [submitResult,     setSubmitResult]     = useState(null);
  const [runError,         setRunError]         = useState(null);
  const [submitError,      setSubmitError]      = useState(null);
  const [activeLeftTab,    setActiveLeftTab]    = useState('description');
  const [activeRightTab,   setActiveRightTab]   = useState('code');
  const [submissionsList,  setSubmissionsList]  = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  const editorRef = useRef(null);
  const { problemId } = useParams();

  // ── Language normalisation ─────────────────────────────────────────────────
  // Handles ALL possible stored values:
  //   'C++', 'c++', 'Cpp', 'CPP'      → matches 'cpp'
  //   'Java', 'java', 'JAVA'           → matches 'java'
  //   'JavaScript', 'javascript', 'JS' → matches 'javascript'
  const normaliseLanguage = (lang) => (lang || '').toLowerCase().trim();

  const findStarterCode = (arr = [], lang) => {
    // Map frontend key to every possible stored value after toLowerCase
    const MATCH = {
      cpp:        ['c++', 'cpp'],
      java:       ['java'],
      javascript: ['javascript', 'js'],
    };
    const targets = MATCH[lang] || [];
    const found = arr.find((sc) => targets.includes(normaliseLanguage(sc.language)));
    return found?.initialCode || '';
  };

  // ── Fetch problem ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProblem = async () => {
      setPageLoading(true);
      try {
        const { data } = await axiosClient.get(`/problem/getProblemById/${problemId}`);

        // ── DEBUG: open browser console (F12) to see exactly what backend returns
        console.log('=== getProblemById response ===');
        console.log('Full data:', data);
        console.log('starterCode field:', data.starterCode);
        console.log('startCode field:', data.startCode);
        // ── END DEBUG

        // Support both field names — old backend used 'startCode' in select()
        const rawStartCodes = data.starterCode || data.startCode || [];

        console.log('rawStartCodes:', rawStartCodes);
        console.log('rawStartCodes languages:', rawStartCodes.map(sc => sc.language));

        // Normalise language values to lowercase so matching works
        // regardless of capitalisation stored in DB
        const normalisedStartCodes = rawStartCodes.map((sc) => ({
          ...sc,
          language: normaliseLanguage(sc.language),
        }));

        console.log('normalisedStartCodes:', normalisedStartCodes);

        const initialCode = findStarterCode(normalisedStartCodes, 'javascript');
        console.log('initialCode for javascript:', initialCode ? initialCode.slice(0, 50) : '(empty)');

        setProblem({ ...data, starterCode: normalisedStartCodes });
        setCode(initialCode);
      } catch (err) {
        console.error('Failed to fetch problem:', err?.response?.status, err?.response?.data);
      } finally {
        setPageLoading(false);
      }
    };
    fetchProblem();
  }, [problemId]);

  // ── Fetch Submissions ──────────────────────────────────────────────────────
  useEffect(() => {
    if (activeLeftTab === 'submissions' && problemId) {
      const fetchSubmissions = async () => {
        setSubmissionsLoading(true);
        try {
          const { data } = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
          setSubmissionsList(Array.isArray(data) ? data : data.submissions || []);
        } catch (err) {
          console.error('Failed to fetch submissions:', err);
          setSubmissionsList([]);
        } finally {
          setSubmissionsLoading(false);
        }
      };
      fetchSubmissions();
    }
  }, [activeLeftTab, problemId]);

  // ── Language change ────────────────────────────────────────────────────────
  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    if (!problem) return;
    const newCode = findStarterCode(problem.starterCode || [], lang);
    console.log(`Language changed to ${lang}, starter code found:`, newCode ? 'yes' : 'no (empty)');
    setCode(newCode);
    setRunResult(null);
    setSubmitResult(null);
    setRunError(null);
    setSubmitError(null);
  };

  // ── Run code ───────────────────────────────────────────────────────────────
  const handleRunCode = async () => {
    setActionLoading(true);
    setRunResult(null);
    setRunError(null);
    try {
      const { data } = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage,
      });
      setRunResult(data);
      setActiveRightTab('testcase');
    } catch (err) {
      console.error('Run error:', err?.response?.data);
      setRunError(err?.response?.data?.error || 'Run failed. Please try again.');
      setActiveRightTab('testcase');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Submit code ────────────────────────────────────────────────────────────
  const handleSubmitCode = async () => {
    setActionLoading(true);
    setSubmitResult(null);
    setSubmitError(null);
    try {
      const { data } = await axiosClient.post(`/submission/submit/${problemId}`, {
        code,
        language: selectedLanguage,
      });
      setSubmitResult(data);
      setActiveRightTab('result');
    } catch (err) {
      console.error('Submit error:', err?.response?.data);
      setSubmitError(err?.response?.data?.error || 'Submission failed. Please try again.');
      setActiveRightTab('result');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-base-100 overflow-hidden">

      {/* ── TOP NAV ── */}
      <div className="navbar bg-base-200 border-b border-base-300 min-h-12 px-4 flex-shrink-0">
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <NavLink to="/" className="font-bold text-lg text-primary flex-shrink-0">
            CodeThrone
          </NavLink>
          {problem && (
            <>
              <span className="text-base-content/30 flex-shrink-0">/</span>
              <span className="font-semibold text-sm truncate">{problem.title}</span>
              <span className={`badge badge-sm flex-shrink-0 ${
                problem.difficulty === 'easy'   ? 'badge-success' :
                problem.difficulty === 'medium' ? 'badge-warning' : 'badge-error'
              }`}>
                {problem.difficulty}
              </span>
            </>
          )}
        </div>

        <div className="flex-none flex items-center gap-2">
          <select
            className="select select-bordered select-sm"
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            disabled={actionLoading}
          >
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>

          <button
            className="btn btn-sm btn-outline btn-success"
            onClick={handleRunCode}
            disabled={actionLoading || pageLoading}
          >
            {actionLoading ? <span className="loading loading-spinner loading-xs" /> : '▶'} Run
          </button>

          <button
            className="btn btn-sm btn-success"
            onClick={handleSubmitCode}
            disabled={actionLoading || pageLoading}
          >
            {actionLoading ? <span className="loading loading-spinner loading-xs" /> : null} Submit
          </button>
        </div>
      </div>

      {/* ── WORKSPACE ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT PANEL ── */}
        <div className="w-1/2 flex flex-col border-r border-base-300 overflow-hidden">
          <div className="tabs tabs-bordered bg-base-200 px-4 flex-shrink-0">
            {['description', 'editorial', 'solutions', 'submissions'].map((t) => (
              <button
                key={t}
                className={`tab ${activeLeftTab === t ? 'tab-active' : ''}`}
                onClick={() => setActiveLeftTab(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {pageLoading && (
              <div className="flex justify-center items-center h-40">
                <span className="loading loading-spinner loading-lg" />
              </div>
            )}

            {!pageLoading && activeLeftTab === 'description' && problem && (
              <div>
                <h2 className="text-xl font-bold mb-2">{problem.title}</h2>
                <div className="flex gap-2 mb-4 flex-wrap">
                  <span className={`badge ${
                    problem.difficulty === 'easy'   ? 'badge-success' :
                    problem.difficulty === 'medium' ? 'badge-warning' : 'badge-error'
                  }`}>
                    {problem.difficulty}
                  </span>
                  {(Array.isArray(problem.tags) ? problem.tags : [problem.tags])
                    .filter(Boolean)
                    .map((tag) => (
                      <span key={tag} className="badge badge-info">{tag}</span>
                    ))
                  }
                </div>

                <p className="text-sm text-base-content/80 mb-6 leading-relaxed whitespace-pre-wrap">
                  {problem.description}
                </p>

                {problem.visibleTestCases?.map((tc, i) => (
                  <div key={i} className="bg-base-200 rounded-lg p-4 mb-4">
                    <p className="font-semibold text-sm mb-2">Example {i + 1}</p>
                    <div className="font-mono text-sm space-y-1">
                      <div><strong>Input:</strong> {tc.input}</div>
                      <div><strong>Output:</strong> {tc.output}</div>
                      {tc.explanation && (
                        <div className="text-base-content/60 text-xs mt-2">
                          <strong>Explanation:</strong> {tc.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!pageLoading && activeLeftTab === 'description' && !problem && (
              <div className="text-center mt-20">
                <p className="text-error font-bold text-lg mb-2">Failed to load problem</p>
                <p className="text-sm text-base-content/50">Check browser console (F12) for details.</p>
              </div>
            )}

            {!pageLoading && activeLeftTab === 'solutions' && problem && (
              <div>
                <h3 className="font-bold text-lg mb-4">Reference Solutions</h3>
                {problem.referenceSolution?.length > 0 ? (
                  <div className="space-y-6">
                    {problem.referenceSolution.map((sol, idx) => (
                      <div key={idx} className="bg-base-300 rounded-lg overflow-hidden">
                        <div className="bg-base-200 px-4 py-2 font-mono text-sm font-semibold border-b border-base-300">
                          {sol.language.toUpperCase()}
                        </div>
                        <div className="p-4 overflow-x-auto">
                          <pre className="font-mono text-sm text-base-content/80 whitespace-pre-wrap">
                            {sol.completeCode}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center mt-10 text-base-content/50">
                    No solutions available for this problem.
                  </div>
                )}
              </div>
            )}

            {!pageLoading && activeLeftTab === 'submissions' && (
              <div>
                <h3 className="font-bold text-xl mb-6 text-center">Submission History</h3>
                {submissionsLoading ? (
                  <div className="flex justify-center mt-10">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                ) : submissionsList.length === 0 ? (
                  <div className="text-center mt-10 text-base-content/50">
                    No submissions found for this problem.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full text-sm">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Language</th>
                          <th>Status</th>
                          <th>Runtime</th>
                          <th>Memory</th>
                          <th>Test Cases</th>
                          <th>Submit Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissionsList.map((sub, idx) => (
                          <tr key={sub._id}>
                            <td>{submissionsList.length - idx}</td>
                            <td>{sub.language}</td>
                            <td>
                              <span className={`badge badge-sm font-semibold ${sub.status === 'accepted' ? 'badge-success' : 'badge-error'}`}>
                                {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                              </span>
                            </td>
                            <td>{sub.runtime ? `${sub.runtime.toFixed(3)} sec` : 'N/A'}</td>
                            <td>{sub.memory ? `${sub.memory} KB` : 'N/A'}</td>
                            <td>{sub.testCasesPassed}/{sub.testCasesTotal}</td>
                            <td className="text-xs opacity-70">
                              {new Date(sub.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {!['description', 'solutions', 'submissions'].includes(activeLeftTab) && (
              <div className="text-base-content/40 text-center mt-20 text-sm">
                {activeLeftTab.charAt(0).toUpperCase() + activeLeftTab.slice(1)} coming soon...
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          <div className="tabs tabs-bordered bg-base-200 px-4 flex-shrink-0">
            {['code', 'testcase', 'result'].map((t) => (
              <button
                key={t}
                className={`tab ${activeRightTab === t ? 'tab-active' : ''}`}
                onClick={() => setActiveRightTab(t)}
              >
                {t === 'testcase' ? 'Test Case' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Code tab */}
          {activeRightTab === 'code' && (
            <div className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                language={MONACO_LANGUAGE[selectedLanguage]}
                value={code}
                onChange={(val) => setCode(val || '')}
                onMount={(editor) => { editorRef.current = editor; }}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  tabSize: 4,
                  automaticLayout: true,
                  padding: { top: 12 },
                  fontFamily: "'Fira Code', monospace",
                  fontLigatures: true,
                }}
              />
            </div>
          )}

          {/* Test Case tab */}
          {activeRightTab === 'testcase' && (
            <div className="flex-1 p-4 overflow-y-auto">
              {actionLoading && (
                <div className="flex justify-center items-center h-40">
                  <span className="loading loading-spinner loading-lg" />
                </div>
              )}
              {!actionLoading && runError && (
                <div className="alert alert-error mb-4 text-sm">{runError}</div>
              )}
              {!actionLoading && runResult && (
                <div className={`alert ${runResult.success === true || runResult.success === 'accepted' ? 'alert-success' : 'alert-error'} mb-4`}>
                  <div className="w-full">
                    {(runResult.success === true || runResult.success === 'accepted') ? (
                      <div>
                        <h4 className="font-bold">✅ All test cases passed!</h4>
                        <p className="text-sm mt-1">Runtime: {runResult.runtime?.toFixed(3)} sec</p>
                        <p className="text-sm">Memory: {runResult.memory} KB</p>
                      </div>
                    ) : (
                      <h4 className="font-bold">❌ Some test cases failed</h4>
                    )}
                    <div className="mt-4 space-y-2">
                      {runResult.testCases?.map((tc, i) => {
                        const passed = tc.status_id === 3;
                        return (
                          <div key={i} className="bg-base-100 p-3 rounded text-xs">
                            <div className="font-mono space-y-1">
                              <div><strong>Input:</strong> {tc.stdin}</div>
                              <div><strong>Expected:</strong> {tc.expected_output}</div>
                              <div><strong>Output:</strong> {tc.stdout ?? '(no output)'}</div>
                              {tc.stderr && <div className="text-error"><strong>Error:</strong> {tc.stderr}</div>}
                              <div className={passed ? 'text-success' : 'text-error'}>
                                {passed ? '✓ Passed' : '✗ Failed'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              {!actionLoading && !runResult && !runError && (
                <div className="text-base-content/40 text-sm text-center mt-20">
                  Click "Run" to test your code against sample cases.
                </div>
              )}
            </div>
          )}

          {/* Result tab */}
          {activeRightTab === 'result' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4">Submission Result</h3>
              {actionLoading && (
                <div className="flex justify-center items-center h-40">
                  <span className="loading loading-spinner loading-lg" />
                </div>
              )}
              {!actionLoading && submitError && (
                <div className="alert alert-error text-sm">{submitError}</div>
              )}
              {!actionLoading && submitResult && (
                <div className={`alert ${submitResult.accepted ? 'alert-success' : 'alert-error'}`}>
                  <div className="w-full">
                    {submitResult.accepted ? (
                      <div>
                        <h4 className="font-bold text-lg">🎉 Accepted</h4>
                        <div className="mt-4 space-y-1 text-sm">
                          <p>Test Cases: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                          <p>Runtime: {submitResult.runtime?.toFixed(3)} sec</p>
                          <p>Memory: {submitResult.memory} KB</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-lg">✗ Wrong Answer</h4>
                        <div className="mt-4 text-sm space-y-1">
                          <p>Test Cases: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                          {submitResult.errorMessage && (
                            <p className="font-mono text-xs mt-2 whitespace-pre-wrap">{submitResult.errorMessage}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {!actionLoading && !submitResult && !submitError && (
                <div className="text-base-content/40 text-sm text-center mt-20">
                  Click "Submit" to evaluate your solution against all test cases.
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProblemPage;