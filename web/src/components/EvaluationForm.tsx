import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  createEvaluation, 
  updateEvaluation, 
  selectCurrentEvaluation,
  selectEvaluationLoading,
  selectEvaluationError,
  selectEvaluationSuccess,
  resetEvaluationState,
  EvaluationCriteria
} from '@/redux/slices/evaluationSlice';
import { toast } from 'react-toastify';

interface EvaluationFormProps {
  userId: string;
  evaluationNumber: number;
  evaluationId?: string;
  onSuccess?: () => void;
}

const EvaluationForm: React.FC<EvaluationFormProps> = ({
  userId,
  evaluationNumber,
  evaluationId,
  onSuccess
}) => {
  const dispatch = useAppDispatch();
  const currentEvaluation = useAppSelector(selectCurrentEvaluation);
  const loading = useAppSelector(selectEvaluationLoading);
  const error = useAppSelector(selectEvaluationError);
  const success = useAppSelector(selectEvaluationSuccess);

  const [criteria, setCriteria] = useState<EvaluationCriteria>({
    davamiyyet: 1,
    isGuzarKeyfiyyetler: 1,
    streseDavamliliq: 1,
    ascImici: 1,
    qavramaMenimseme: 1,
    ixtisasBiliyi: 1,
    muhendisEtikasi: 1,
    komandaIleIslemeBacarigi: 1
  });
  const [comments, setComments] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Initialize form with current evaluation data if editing
  useEffect(() => {
    if (evaluationId && currentEvaluation) {
      setCriteria(currentEvaluation.criteria);
      setComments(currentEvaluation.comments || '');
    }
  }, [evaluationId, currentEvaluation]);

  // Handle success and error messages
  useEffect(() => {
    if (success) {
      toast.success(evaluationId ? 'Qiymətləndirmə yenilendi' : 'Qiymətləndirmə yaradıldı');
      if (onSuccess) {
        onSuccess();
      }
      dispatch(resetEvaluationState());
    }
    if (error) {
      toast.error(error);
      dispatch(resetEvaluationState());
    }
  }, [success, error, dispatch, evaluationId, onSuccess]);

  // Handle criteria change
  const handleCriteriaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    
    if (numValue < 1 || numValue > 10) {
      setFormErrors({
        ...formErrors,
        [name]: 'Değer 1 ile 10 arasında olmalıdır'
      });
    } else {
      const newErrors = { ...formErrors };
      delete newErrors[name];
      setFormErrors(newErrors);
    }

    setCriteria({
      ...criteria,
      [name]: numValue
    });
  };

  // Handle comments change
  const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComments(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (Object.keys(formErrors).length > 0) {
      toast.error('Lütfen formdaki hataları düzeltin');
      return;
    }

    if (evaluationId) {
      // Update existing evaluation
      dispatch(updateEvaluation({
        id: evaluationId,
        evaluationData: {
          criteria,
          comments
        }
      }));
    } else {
      // Create new evaluation
      dispatch(createEvaluation({
        userId,
        evaluationNumber,
        criteria,
        comments
      }));
    }
  };

  const criteriaLabels: Record<keyof EvaluationCriteria, string> = {
    davamiyyet: 'Davamiyyet',
    isGuzarKeyfiyyetler: 'İşgüzar keyfiyyətlər',
    streseDavamliliq: 'Stresə davamlılıq',
    ascImici: 'ASC imici',
    qavramaMenimseme: 'Qavrama mənimsəmə',
    ixtisasBiliyi: 'İxtisas biliyi',
    muhendisEtikasi: 'Mühəndis etikası',
    komandaIleIslemeBacarigi: 'Komanda ilə işləmə bacarığı'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {evaluationId ? 'Qiymətləndirməni Düzenle' : 'Yeni Qiymətləndirmə'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {Object.entries(criteriaLabels).map(([key, label]) => (
            <div key={key} className="flex flex-col">
              <div className="flex justify-between items-center">
                <label htmlFor={key} className="font-medium text-gray-700">
                  {label}
                </label>
                <span className="text-sm font-medium text-blue-600">
                  {criteria[key as keyof EvaluationCriteria]}/10
                </span>
              </div>
              <input
                type="range"
                id={key}
                name={key}
                min="1"
                max="10"
                value={criteria[key as keyof EvaluationCriteria]}
                onChange={handleCriteriaChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              {formErrors[key] && (
                <p className="text-red-500 text-sm mt-1">{formErrors[key]}</p>
              )}
            </div>
          ))}

          <div className="flex flex-col">
            <label htmlFor="comments" className="font-medium text-gray-700 mb-1">
              Yorumlar
            </label>
            <textarea
              id="comments"
              name="comments"
              value={comments}
              onChange={handleCommentsChange}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Qiymətləndirmə hakkında şerhlerinizi yazın..."
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  İşleniyor...
                </span>
              ) : evaluationId ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EvaluationForm; 