import * as XLSX from 'xlsx';

// Evaluation type from the profile page
interface Evaluation {
  _id: string;
  userId: string;
  evaluationNumber: number;
  evaluatorId: string;
  evaluationDate: string;
  averageScore: number;
  comments?: string;
  criteria?: {
    davamiyyet: number;
    isGuzarKeyfiyyetler: number;
    streseDavamliliq: number;
    ascImici: number;
    qavramaMenimseme: number;
    ixtisasBiliyi: number;
    muhendisEtikasi: number;
    komandaIleIslemeBacarigi: number;
  };
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Department with evaluations
interface Department {
  name: string;
  evaluations: {
    [key: number]: Evaluation[]; // key is evaluation number (1, 2, 3)
  };
}

/**
 * Exports department evaluations to Excel file
 * @param departments Map of department data
 * @param fileName Name of the excel file
 */
export const exportDepartmentEvaluationsToExcel = (departments: Department[], fileName: string = 'department-evaluations.xlsx') => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Define styles for different elements
  const titleStyle = {
    font: { bold: true, size: 16, color: { rgb: "1F4E79" } },
    alignment: { horizontal: 'center', vertical: 'center' },
    fill: { fgColor: { rgb: "EDF2F9" } },
    border: {
      top: { style: 'thin', color: { rgb: "CCCCCC" } },
      bottom: { style: 'thin', color: { rgb: "CCCCCC" } },
      left: { style: 'thin', color: { rgb: "CCCCCC" } },
      right: { style: 'thin', color: { rgb: "CCCCCC" } }
    }
  };
  
  const evaluationHeaderStyle = {
    font: { bold: true, size: 14, color: { rgb: "FFFFFF" } },
    alignment: { horizontal: 'center', vertical: 'center' },
    fill: { fgColor: { rgb: "305496" } },
    border: {
      top: { style: 'thin', color: { rgb: "CCCCCC" } },
      bottom: { style: 'thin', color: { rgb: "CCCCCC" } },
      left: { style: 'thin', color: { rgb: "CCCCCC" } },
      right: { style: 'thin', color: { rgb: "CCCCCC" } }
    }
  };
  
  const tableHeaderStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    alignment: { horizontal: 'center', vertical: 'center' },
    fill: { fgColor: { rgb: "4472C4" } },
    border: {
      top: { style: 'thin', color: { rgb: "B4C6E7" } },
      bottom: { style: 'thin', color: { rgb: "B4C6E7" } },
      left: { style: 'thin', color: { rgb: "B4C6E7" } },
      right: { style: 'thin', color: { rgb: "B4C6E7" } }
    }
  };
  
  const cellBorderStyle = {
    border: {
      top: { style: 'thin', color: { rgb: "D9D9D9" } },
      bottom: { style: 'thin', color: { rgb: "D9D9D9" } },
      left: { style: 'thin', color: { rgb: "D9D9D9" } },
      right: { style: 'thin', color: { rgb: "D9D9D9" } }
    }
  };
  
  const evenRowStyle = {
    fill: { fgColor: { rgb: "F2F2F2" } },
    border: {
      top: { style: 'thin', color: { rgb: "D9D9D9" } },
      bottom: { style: 'thin', color: { rgb: "D9D9D9" } },
      left: { style: 'thin', color: { rgb: "D9D9D9" } },
      right: { style: 'thin', color: { rgb: "D9D9D9" } }
    }
  };
  
  const scoreStyle = (score: number) => ({
    font: { bold: true, color: { rgb: "FFFFFF" } },
    alignment: { horizontal: 'center' },
    fill: { 
      fgColor: { 
        rgb: score >= 80 ? "70AD47" : // Green
             score >= 60 ? "4472C4" : // Blue
             score >= 40 ? "ED7D31" : // Orange
                          "C00000"    // Red
      } 
    },
    border: {
      top: { style: 'thin', color: { rgb: "D9D9D9" } },
      bottom: { style: 'thin', color: { rgb: "D9D9D9" } },
      left: { style: 'thin', color: { rgb: "D9D9D9" } },
      right: { style: 'thin', color: { rgb: "D9D9D9" } }
    }
  });
  
  // Column widths in characters
  const columnWidths = [
    { wch: 20 },  // Name
    { wch: 25 },  // Email
    { wch: 10 },  // Average
    { wch: 12 },  // Davamiyyet
    { wch: 10 },  // İşgüzar
    { wch: 10 },  // Stres
    { wch: 10 },  // ASC
    { wch: 10 },  // Qavrama
    { wch: 10 },  // İxtisas
    { wch: 10 },  // Etika
    { wch: 10 },  // Komanda
    { wch: 15 }   // Date
  ];
  
  // Process each department
  departments.forEach((department, index) => {
    // Create data for this department sheet
    const sheetData: (string | number | undefined | null)[][] = [];
    
    // Ensure department name is valid and unique
    let sheetName = department.name || 'Unknown Department';
    let displayName = department.name || 'Departament Bilinmiyor';
    
    // If department name is empty or "Unknown Department", append an index to make it unique
    if (!department.name || department.name === 'Unknown Department') {
      sheetName = `Unknown Department ${index + 1}`;
      displayName = `Departament Bilinmiyor ${index + 1}`;
    }
    
    // Make sure sheet name doesn't exceed 31 characters (Excel limitation)
    if (sheetName.length > 31) {
      sheetName = sheetName.substring(0, 28) + '...';
    }
    
    // Make sure sheet name doesn't contain invalid characters
    sheetName = sheetName.replace(/[*?:\/\\[\]]/g, '_');
    
    // Add department name as header
    sheetData.push([`${displayName} Bölümü Değerlendirmeleri`]);
    sheetData.push([]); // Empty row for spacing
    
    // Process each evaluation number (1, 2, 3)
    [1, 2, 3].forEach(evalNumber => {
      const evaluations = department.evaluations[evalNumber] || [];
      
      if (evaluations.length > 0) {
        // Add evaluation number header
        sheetData.push([`${evalNumber}. Değerlendirme`]);
        
        // Add headers for table
        sheetData.push([
          'Ad Soyad',
          'E-posta',
          'Ortalama',
          'Davamiyyet',
          'İşgüzar',
          'Stres',
          'ASC',
          'Qavrama',
          'İxtisas',
          'Etika',
          'Komanda',
          'Tarih'
        ]);
        
        // Add data rows
        evaluations.forEach((evaluation) => {
          const fullName = `${evaluation.user?.firstName || ''} ${evaluation.user?.lastName || ''}`.trim();
          const email = evaluation.user?.email || '';
          const averageScore = evaluation.averageScore;
          const evaluationDate = new Date(evaluation.evaluationDate).toLocaleDateString('tr-TR');
          
          // Add row
          sheetData.push([
            fullName,
            email,
            averageScore,
            evaluation.criteria?.davamiyyet || '-',
            evaluation.criteria?.isGuzarKeyfiyyetler || '-',
            evaluation.criteria?.streseDavamliliq || '-',
            evaluation.criteria?.ascImici || '-',
            evaluation.criteria?.qavramaMenimseme || '-',
            evaluation.criteria?.ixtisasBiliyi || '-',
            evaluation.criteria?.muhendisEtikasi || '-',
            evaluation.criteria?.komandaIleIslemeBacarigi || '-',
            evaluationDate
          ]);
        });
        
        // Add empty row for spacing
        sheetData.push([]);
        sheetData.push([]);
      }
    });
    
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    
    // Set column widths
    worksheet['!cols'] = columnWidths;
    
    // Apply styling
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // Loop through all cells to apply styles
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellAddress]) continue;
        
        const cell = worksheet[cellAddress];
        
        // Department title (first row)
        if (R === 0) {
          worksheet[cellAddress].s = titleStyle;
          // Merge cells for the title across all columns
          if (C === 0) {
            worksheet['!merges'] = worksheet['!merges'] || [];
            worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: range.e.c } });
          }
          continue;
        }
        
        // Evaluation number header (e.g. "1. Değerlendirme")
        if (cell.v && typeof cell.v === 'string' && cell.v.includes('. Değerlendirme')) {
          worksheet[cellAddress].s = evaluationHeaderStyle;
          // Merge cells for the evaluation header across all columns
          worksheet['!merges'] = worksheet['!merges'] || [];
          worksheet['!merges'].push({ s: { r: R, c: C }, e: { r: R, c: range.e.c } });
          continue;
        }
        
        // Table headers (column names)
        if (R > 0 && cell.v && 
            (typeof cell.v === 'string' && 
             ['Ad Soyad', 'E-posta', 'Ortalama', 'Davamiyyet', 'İşgüzar', 'Stres', 
              'ASC', 'Qavrama', 'İxtisas', 'Etika', 'Komanda', 'Tarih'].includes(cell.v))) {
          worksheet[cellAddress].s = tableHeaderStyle;
          continue;
        }
        
        // Apply styles to data cells
        if (R > 0 && cell.v !== undefined) {
          // Special formatting for average score column
          if (C === 2 && typeof cell.v === 'number') {
            worksheet[cellAddress].s = scoreStyle(cell.v);
          } 
          // Alternating row colors for data rows
          else if (R % 2 === 1) {
            worksheet[cellAddress].s = evenRowStyle;
          } 
          // Default border style for all other cells
          else {
            worksheet[cellAddress].s = cellBorderStyle;
          }
        }
      }
    }
    
    // Add the worksheet to the workbook with the unique, valid name
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });
  
  // Set workbook properties
  workbook.Props = {
    Title: "Beyin Merkezi - Değerlendirmeler",
    Subject: "Departman Değerlendirmeleri",
    Author: "Beyin Merkezi Admin",
    CreatedDate: new Date()
  };
  
  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, fileName);
};

/**
 * Fetches all department evaluations and exports to Excel
 * @param apiUrl API base URL
 * @param token Authentication token
 */
export const fetchAndExportAllDepartmentEvaluations = async (apiUrl: string, token: string) => {
  try {
    // Ensure the API URL is properly formatted
    const baseUrl = apiUrl.replace(/\/+$/, '');
    
    // First get all departments
    const departmentsUrl = `${baseUrl}/api/departments`;
    console.log('Fetching departments from:', departmentsUrl);
    
    const departmentsResponse = await fetch(departmentsUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    const responseText = await departmentsResponse.text();
    let departmentsData;
    
    try {
      departmentsData = JSON.parse(responseText);
    } catch (error: unknown) {
      console.error('Failed to parse departments response as JSON:', responseText, error);
      throw new Error(`Invalid response format: ${responseText.substring(0, 100)}... (${error instanceof Error ? error.message : 'Parse error'})`);
    }
    
    if (!departmentsResponse.ok) {
      console.error('Departments fetch failed:', departmentsResponse.status, departmentsData);
      throw new Error(`Department fetch failed: ${departmentsResponse.status} - ${departmentsData?.message || 'Unknown error'}`);
    }
    
    try {
      if (!departmentsData.data || !Array.isArray(departmentsData.data)) {
        console.error('Response structure:', departmentsData);
        throw new Error('Invalid response format: departments data array not found');
      }
      
      const departments = departmentsData.data;
      console.log(`Successfully fetched ${departments.length} departments`);
      
      if (departments.length === 0) {
        throw new Error('No departments found to export');
      }
      
      // For each department, fetch evaluations for each evaluation number
      const departmentsWithEvaluations: Department[] = [];
      
      // Process departments sequentially to avoid overwhelming the server
      for (const department of departments) {
        console.log(`Processing department: ${department.name} (${department._id})`);
        
        const departmentWithEvals: Department = {
          name: department.name,
          evaluations: {
            1: [],
            2: [],
            3: []
          }
        };
        
        // Fetch evaluations for each evaluation number (1, 2, 3)
        for (let evalNumber = 1; evalNumber <= 3; evalNumber++) {
          const evalUrl = `${baseUrl}/api/evaluations?departmentId=${department._id}&evaluationNumber=${evalNumber}`;
          console.log(`Fetching evaluations: ${evalUrl}`);
          
          try {
            const evalResponse = await fetch(evalUrl, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
            });
            
            if (evalResponse.ok) {
              const evalData = await evalResponse.json();
              console.log(`Found ${evalData.evaluations?.length || 0} evaluations for ${department.name}, evaluation #${evalNumber}`);
              departmentWithEvals.evaluations[evalNumber] = evalData.evaluations || [];
            } else {
              console.warn(`Failed to fetch evaluations for ${department.name}, evaluation #${evalNumber}: ${evalResponse.status}`);
            }
          } catch (evalError: unknown) {
            console.error(`Error fetching evaluations for ${department.name}, evaluation #${evalNumber}:`, evalError);
            // Continue with other evaluations rather than failing completely
          }
        }
        
        departmentsWithEvaluations.push(departmentWithEvals);
      }
      
      if (departmentsWithEvaluations.length === 0) {
        throw new Error('No evaluations found to export');
      }
      
      // Generate Excel file with all department data
      const fileName = `beyin-merkezi-degerlendirmeler-${new Date().toISOString().split('T')[0]}.xlsx`;
      console.log(`Exporting to Excel: ${fileName} with ${departmentsWithEvaluations.length} departments`);
      exportDepartmentEvaluationsToExcel(departmentsWithEvaluations, fileName);
      
      return true;
    } catch (error: unknown) {
      console.error('Error processing departments data:', error);
      throw new Error('Failed to process departments data');
    }
  } catch (error: unknown) {
    console.error('Error processing evaluations data:', error);
    throw new Error('Failed to process evaluations data');
  }
}; 