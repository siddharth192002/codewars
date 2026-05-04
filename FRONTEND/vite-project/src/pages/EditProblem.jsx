import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { AlertCircle, Plus, Trash2, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import axiosClient from "../utils/axiosClient";

const LANGUAGES = ['c++', 'java', 'javascript'];
const LANGUAGE_LABELS = { 'c++': 'C++', 'java': 'Java', 'javascript': 'JavaScript' };

const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1),
  starterCode: z.array(
    z.object({
      language: z.enum(['c++', 'java', 'javascript']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['c++', 'java', 'javascript']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3),
  wrapperCode: z.array(
    z.object({
      language: z.enum(['c++', 'java', 'javascript']),
      code: z.string().min(1, 'Wrapper code is required')
    })
  ).length(3)
});

export default function EditProblem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitStatus, setSubmitStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: '',
      description: '',
      difficulty: 'easy',
      tags: ['array'],
      visibleTestCases: [{ input: '', output: '', explanation: '' }],
      hiddenTestCases: [{ input: '', output: '' }],
      starterCode: [
        { language: 'c++', initialCode: '' },
        { language: 'java', initialCode: '' },
        { language: 'javascript', initialCode: '' }
      ],
      referenceSolution: [
        { language: 'c++', completeCode: '' },
        { language: 'java', completeCode: '' },
        { language: 'javascript', completeCode: '' }
      ],
      wrapperCode: [
        { language: 'c++', code: '#include <iostream>\nusing namespace std;\n\n// USER_CODE_HERE\n\nint main() {\n    // Read input and call user function\n    return 0;\n}' },
        { language: 'java', code: 'import java.util.*;\n\npublic class Main {\n    // USER_CODE_HERE\n\n    public static void main(String[] args) {\n        // Read input and call user function\n    }\n}' },
        { language: 'javascript', code: 'const fs = require("fs");\nconst input = fs.readFileSync("/dev/stdin", "utf-8").trim().split("\\n");\n\n// USER_CODE_HERE\n\n// Call user function and console.log result' }
      ]
    }
  });

  useEffect(() => {
    setLoading(true);
    axiosClient.get(`/problem/getProblemById/${id}`)
      .then(res => {
        const data = res.data;
        reset({
          title: data.title || '',
          description: data.description || '',
          difficulty: data.difficulty || 'easy',
          tags: Array.isArray(data.tags) && data.tags.length > 0 ? data.tags : ['array'],
          visibleTestCases: data.visibleTestCases?.length ? data.visibleTestCases : [{ input: '', output: '', explanation: '' }],
          hiddenTestCases: data.hiddenTestCases?.length ? data.hiddenTestCases : [{ input: '', output: '' }],
          starterCode: data.starterCode || [
            { language: 'c++', initialCode: '' },
            { language: 'java', initialCode: '' },
            { language: 'javascript', initialCode: '' }
          ],
          referenceSolution: data.referenceSolution || [
            { language: 'c++', completeCode: '' },
            { language: 'java', completeCode: '' },
            { language: 'javascript', completeCode: '' }
          ],
          wrapperCode: data.wrapperCode?.length === 3 ? data.wrapperCode : [
            { language: 'c++', code: '#include <iostream>\nusing namespace std;\n\n// USER_CODE_HERE\n\nint main() {\n    // Read input and call user function\n    return 0;\n}' },
            { language: 'java', code: 'import java.util.*;\n\npublic class Main {\n    // USER_CODE_HERE\n\n    public static void main(String[] args) {\n        // Read input and call user function\n    }\n}' },
            { language: 'javascript', code: 'const fs = require("fs");\nconst input = fs.readFileSync("/dev/stdin", "utf-8").trim().split("\\n");\n\n// USER_CODE_HERE\n\n// Call user function and console.log result' }
          ]
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id, reset]);

  const { fields: visibleFields, append: appendVisible, remove: removeVisible } =
    useFieldArray({ control, name: 'visibleTestCases' });

  const { fields: hiddenFields, append: appendHidden, remove: removeHidden } =
    useFieldArray({ control, name: 'hiddenTestCases' });

  const onSubmit = async (data) => {
    try {
      setSubmitStatus('submitting');
      await axiosClient.put(`/problem/update/${id}`, data);
      setSubmitStatus('success');
      setTimeout(() => navigate('/admin/edit-list'), 700);
    } catch (error) {
      console.error('Update problem error:', error);
      setSubmitStatus('error');
    }
  };

  const formCardClasses = "bg-base-100 rounded-lg shadow-md p-6 text-base-content border border-base-300";

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 text-base-content py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="bg-base-100 rounded-lg shadow-md p-6 mb-6 border border-base-300">
          <h1 className="text-3xl font-bold mb-2">Edit Problem</h1>
          <p className="opacity-80">Update the details for this coding problem</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* BASIC INFO */}
          <div className={formCardClasses}>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">

              <div>
                <label className="block mb-1 font-medium">Title</label>
                <input {...register("title")} className="input input-bordered w-full" placeholder="Two Sum" />
                {errors.title && <p className="text-error text-sm mt-1 flex items-center gap-1"><AlertCircle size={14} /> {errors.title.message}</p>}
              </div>

              <div>
                <label className="block mb-1 font-medium">Description</label>
                <textarea {...register("description")} rows={4} className="textarea textarea-bordered w-full" />
                {errors.description && <p className="text-error text-sm mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Difficulty</label>
                  <select {...register("difficulty")} className="select select-bordered w-full">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Tag</label>
                  <select {...register("tags.0")} className="select select-bordered w-full">
                    <option value="array">Array</option>
                    <option value="linkedlist">Linked List</option>
                    <option value="graph">Graph</option>
                    <option value="dp">Dynamic Programming</option>
                    <option value="string">String</option>
                    <option value="hashmap">HashMap</option>
                    <option value="tree">Tree</option>
                    <option value="stack">Stack</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* VISIBLE TEST CASES */}
          <div className={formCardClasses}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Visible Test Cases</h2>
              <button type="button" onClick={() => appendVisible({ input: '', output: '', explanation: '' })} className="btn btn-primary btn-sm">
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="space-y-4">
              {visibleFields.map((field, index) => (
                <div key={field.id} className="border border-base-300 p-4 rounded-lg">
                  <h3 className="font-medium mb-3">Test Case {index + 1}</h3>
                  <div className="space-y-3">
                    <input {...register(`visibleTestCases.${index}.input`)} className="input input-bordered w-full" placeholder="Input" />
                    <input {...register(`visibleTestCases.${index}.output`)} className="input input-bordered w-full" placeholder="Output" />
                    <textarea {...register(`visibleTestCases.${index}.explanation`)} className="textarea textarea-bordered w-full" placeholder="Explanation" />
                    {visibleFields.length > 1 && (
                      <button type="button" onClick={() => removeVisible(index)} className="btn btn-error btn-xs mt-2">
                        <Trash2 size={14} /> Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HIDDEN TEST CASES */}
          <div className={formCardClasses}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Hidden Test Cases</h2>
              <button type="button" onClick={() => appendHidden({ input: '', output: '' })} className="btn btn-primary btn-sm">
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="space-y-4">
              {hiddenFields.map((field, index) => (
                <div key={field.id} className="border border-base-300 p-4 rounded-lg">
                  <h3 className="font-medium mb-3">Hidden Case {index + 1}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input {...register(`hiddenTestCases.${index}.input`)} className="input input-bordered w-full" placeholder="Input" />
                    <input {...register(`hiddenTestCases.${index}.output`)} className="input input-bordered w-full" placeholder="Output" />
                  </div>
                  {hiddenFields.length > 1 && (
                    <button type="button" onClick={() => removeHidden(index)} className="btn btn-error btn-xs mt-2">
                      <Trash2 size={14} /> Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* STARTER CODE */}
          <div className={formCardClasses}>
            <h2 className="text-xl font-semibold mb-4">Starter Code</h2>
            <div className="space-y-4">
              {LANGUAGES.map((lang, index) => (
                <div key={lang}>
                  <label className="block mb-1 font-medium">{LANGUAGE_LABELS[lang]}</label>
                  <textarea
                    {...register(`starterCode.${index}.initialCode`)}
                    rows={4}
                    className="textarea textarea-bordered w-full font-mono text-sm"
                    placeholder={`// ${LANGUAGE_LABELS[lang]} starter code`}
                  />
                  {errors.starterCode?.[index]?.initialCode && (
                    <p className="text-error text-sm mt-1">{errors.starterCode[index].initialCode.message}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* REFERENCE SOLUTION */}
          <div className={formCardClasses}>
            <h2 className="text-xl font-semibold mb-4">Reference Solution</h2>
            <div className="space-y-4">
              {LANGUAGES.map((lang, index) => (
                <div key={lang}>
                  <label className="block mb-1 font-medium">{LANGUAGE_LABELS[lang]}</label>
                  <textarea
                    {...register(`referenceSolution.${index}.completeCode`)}
                    rows={6}
                    className="textarea textarea-bordered w-full font-mono text-sm"
                    placeholder={`// ${LANGUAGE_LABELS[lang]} complete solution`}
                  />
                  {errors.referenceSolution?.[index]?.completeCode && (
                    <p className="text-error text-sm mt-1">{errors.referenceSolution[index].completeCode.message}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* WRAPPER CODE */}
          <div className={formCardClasses}>
            <h2 className="text-xl font-semibold mb-4">Wrapper Code</h2>
            <p className="text-sm opacity-70 mb-4">
              This code will wrap the user's submission before sending to Judge0. 
              Use <strong>// USER_CODE_HERE</strong> exactly once where the user's function should be injected.
            </p>
            <div className="space-y-4">
              {LANGUAGES.map((lang, index) => (
                <div key={lang}>
                  <label className="block mb-1 font-medium">{LANGUAGE_LABELS[lang]}</label>
                  <textarea
                    {...register(`wrapperCode.${index}.code`)}
                    rows={8}
                    className="textarea textarea-bordered w-full font-mono text-sm bg-base-200"
                    placeholder={`// ${LANGUAGE_LABELS[lang]} wrapper code`}
                  />
                  {errors.wrapperCode?.[index]?.code && (
                    <p className="text-error text-sm mt-1">{errors.wrapperCode[index].code.message}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SUBMIT */}
          <div className={formCardClasses}>
            <button
              type="submit"
              className="btn btn-warning w-full flex items-center gap-2 text-warning-content"
              disabled={isSubmitting}
            >
              <Save size={18} />
              {isSubmitting ? "Updating Problem..." : "Update Problem"}
            </button>

            {submitStatus === "success" && (
              <div className="alert alert-success mt-4">Problem updated successfully! Redirecting...</div>
            )}
            {submitStatus === "error" && (
              <div className="alert alert-error mt-4">Failed to update problem. Check that all reference solutions pass the test cases.</div>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}
