import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useAppSelector } from '@/redux/hooks';

interface Department {
  _id: string;
  name: string;
}

interface DepartmentOption {
  value: string;
  label: string;
}

interface DepartmentSelectProps {
  value: string | undefined | { _id: string; name: string };
  onChange: (departmentId: string | undefined) => void;
  isDisabled?: boolean;
}

const DepartmentSelect: React.FC<DepartmentSelectProps> = ({ value, onChange, isDisabled = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<DepartmentOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const fetchDepartments = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('http://localhost:5001/api/departments', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Departamentleri almaqda xeta yaranadi');
        }

        const departmentOptions = data.data.map((department: Department) => ({
          value: department._id,
          label: department.name,
        }));

        setOptions(departmentOptions);
      } catch (err: unknown) {
        let errorMessage = 'Departamentleri almaqda xeta yaranadi';
        
        if (err instanceof Error) {
          errorMessage = err.message || errorMessage;
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchDepartments();
    }
  }, [token]);

  // Handle both string and object values
  const getDepartmentId = (value: string | undefined | { _id: string; name: string }): string | undefined => {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    return value._id;
  };

  const selectedOption = options.find(option => option.value === getDepartmentId(value));

  return (
    <div>
      <Select
        value={selectedOption}
        onChange={(option) => onChange(option ? option.value : undefined)}
        options={options}
        isLoading={isLoading}
        isDisabled={isDisabled}
        placeholder="Departamentleri seçin"
        isClearable
        className="react-select-container"
        classNamePrefix="react-select"
      />
      {error && (
        <div className="text-red-500 text-sm mt-1">{error}</div>
      )}
    </div>
  );
};

export default DepartmentSelect; 