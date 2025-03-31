import { Request, Response } from 'express';
import Evaluation, { IEvaluation } from '../models/Evaluation';
import User from '../models/User';
import mongoose from 'mongoose';

// @desc    Create a new evaluation
// @route   POST /api/evaluations
// @access  Private/Admin
export const createEvaluation = async (req: Request, res: Response) => {
  try {
    console.log('Create evaluation request body:', JSON.stringify(req.body, null, 2));
    
    const {
      userId,
      evaluationNumber,
      criteria,
      comments
    } = req.body;

    console.log('Extracted criteria:', JSON.stringify(criteria, null, 2));

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if this evaluation number already exists for this user
    const existingEvaluation = await Evaluation.findOne({
      userId,
      evaluationNumber,
    });

    if (existingEvaluation) {
      return res.status(400).json({
        success: false,
        message: `Evaluation #${evaluationNumber} already exists for this user`,
      });
    }

    // Create evaluation with detailed error handling
    try {
      const evaluationData = {
        userId,
        evaluationNumber,
        // @ts-ignore - Ignoring type issues with req.user._id
        evaluatedBy: req.user?._id,
        davamiyyet: criteria.davamiyyet,
        isguzarKeyfiyetler: criteria.isGuzarKeyfiyyetler,
        streseDavamliliq: criteria.streseDavamliliq,
        ascImici: criteria.ascImici,
        qavramaMenimseme: criteria.qavramaMenimseme,
        ixtisasBiliyi: criteria.ixtisasBiliyi,
        muhendisEtikasi: criteria.muhendisEtikasi,
        komandaIleIslemeBacarigi: criteria.komandaIleIslemeBacarigi,
        comments
      };
      
      console.log('Evaluation data to be saved:', JSON.stringify(evaluationData, null, 2));
      
      const evaluation = await Evaluation.create(evaluationData);
      
      // Update user's average score
      await updateUserAverageScore(userId);

      return res.status(201).json({
        success: true,
        data: evaluation,
      });
    } catch (createError: any) {
      console.error('Error creating evaluation document:', createError);
      return res.status(400).json({
        success: false,
        message: `Error creating evaluation: ${createError.message}`,
        errors: createError.errors
      });
    }
  } catch (error: any) {
    console.error('Create evaluation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// @desc    Get all evaluations
// @route   GET /api/evaluations
// @access  Private/Admin
export const getEvaluations = async (req: Request, res: Response) => {
  try {
    // Extract query parameters
    const departmentId = req.query.departmentId as string;
    const year = req.query.year as string;
    const evaluationNumber = req.query.evaluationNumber ? parseInt(req.query.evaluationNumber as string) : undefined;
    
    console.log('Query params:', { departmentId, year, evaluationNumber });
    
    // Build query
    let query: any = {};
    
    // If departmentId is provided, find users in that department first
    if (departmentId) {
      const usersInDepartment = await User.find({ departmentId }).select('_id');
      const userIds = usersInDepartment.map(user => user._id);
      query.userId = { $in: userIds };
    }
    
    // If year is provided, filter by evaluation date
    if (year) {
      const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
      const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
      query.evaluationDate = { $gte: startDate, $lte: endDate };
    }
    
    // If evaluationNumber is provided, filter by evaluation number
    if (evaluationNumber !== undefined) {
      query.evaluationNumber = evaluationNumber;
    }
    
    console.log('Built query:', query);

    const evaluations = await Evaluation.find(query)
      .populate('userId', 'email firstName lastName departmentId')
      .populate('evaluatedBy', 'email firstName lastName');

    console.log('Backend - Raw evaluations:', evaluations);

    // Get available years for filtering
    let availableYears: number[] = [];
    if (departmentId) {
      // Find all evaluation dates for this department
      const usersInDepartment = await User.find({ departmentId }).select('_id');
      const userIds = usersInDepartment.map(user => user._id);
      
      const yearAggregation = await Evaluation.aggregate([
        { $match: { userId: { $in: userIds } } },
        { 
          $group: { 
            _id: { $year: "$evaluationDate" } 
          } 
        },
        { $sort: { _id: -1 } }
      ]);
      
      availableYears = yearAggregation.map(item => item._id);
      
      // If no years found, add current year
      if (availableYears.length === 0) {
        availableYears.push(new Date().getFullYear());
      }
    }

    // Transform the data to match the frontend structure
    const transformedEvaluations = evaluations.map(evaluation => {
      const { 
        _id, 
        userId, 
        evaluationNumber, 
        evaluatedBy, 
        evaluationDate, 
        davamiyyet,
        isguzarKeyfiyetler,
        streseDavamliliq,
        ascImici,
        qavramaMenimseme,
        ixtisasBiliyi,
        muhendisEtikasi,
        komandaIleIslemeBacarigi,
        averageScore,
        comments,
        createdAt,
        updatedAt
      } = evaluation;

      // Extract user and evaluator data
      const userObj = userId as any;
      const user = userObj && typeof userObj === 'object' && userObj.firstName ? {
        firstName: userObj.firstName || '',
        lastName: userObj.lastName || '',
        email: userObj.email || '',
        departmentId: userObj.departmentId || null
      } : null;

      const evaluatorObj = evaluatedBy as any;
      const evaluator = evaluatorObj && typeof evaluatorObj === 'object' && evaluatorObj.firstName ? {
        firstName: evaluatorObj.firstName || '',
        lastName: evaluatorObj.lastName || '',
        email: evaluatorObj.email || ''
      } : null;

      return {
        _id,
        userId: userObj && typeof userObj === 'object' && userObj._id ? userObj._id : userId,
        evaluationNumber,
        evaluatorId: evaluatorObj && typeof evaluatorObj === 'object' && evaluatorObj._id ? evaluatorObj._id : evaluatedBy,
        evaluationDate,
        criteria: {
          davamiyyet,
          isGuzarKeyfiyyetler: isguzarKeyfiyetler,
          streseDavamliliq,
          ascImici,
          qavramaMenimseme,
          ixtisasBiliyi,
          muhendisEtikasi,
          komandaIleIslemeBacarigi
        },
        averageScore,
        comments,
        createdAt,
        updatedAt,
        user,
        evaluator
      };
    });

    console.log('Backend - Transformed evaluations:', transformedEvaluations);
    console.log('Backend - Available years:', availableYears);

    return res.status(200).json({
      success: true,
      count: evaluations.length,
      evaluations: transformedEvaluations,
      years: availableYears
    });
  } catch (error: any) {
    console.error('Get evaluations error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// @desc    Get evaluations by user ID
// @route   GET /api/evaluations/user/:userId
// @access  Private
export const getEvaluationsByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user is admin or the user is requesting their own data
    if (
      req.user?.userType !== 'Admin' && 
      // @ts-ignore - Ignoring type issues with req.user._id
      req.user?._id.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these evaluations',
      });
    }

    const evaluations = await Evaluation.find({ userId })
      .populate('evaluatedBy', 'email firstName lastName')
      .sort({ evaluationNumber: 1 });

    // Transform the data to match the frontend structure
    const transformedEvaluations = evaluations.map(evaluation => {
      const { 
        _id, 
        userId, 
        evaluationNumber, 
        evaluatedBy, 
        evaluationDate, 
        davamiyyet,
        isguzarKeyfiyetler,
        streseDavamliliq,
        ascImici,
        qavramaMenimseme,
        ixtisasBiliyi,
        muhendisEtikasi,
        komandaIleIslemeBacarigi,
        averageScore,
        comments,
        createdAt,
        updatedAt
      } = evaluation;

      // Extract evaluator data
      const evaluatorObj = evaluatedBy as any;
      const evaluator = evaluatorObj && typeof evaluatorObj === 'object' && evaluatorObj.firstName ? {
        firstName: evaluatorObj.firstName || '',
        lastName: evaluatorObj.lastName || '',
        email: evaluatorObj.email || ''
      } : null;

      // Add user data
      const userInfo = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      };

      return {
        _id,
        userId,
        evaluationNumber,
        evaluatorId: evaluatorObj && typeof evaluatorObj === 'object' && evaluatorObj._id ? evaluatorObj._id : evaluatedBy,
        evaluationDate,
        criteria: {
          davamiyyet,
          isGuzarKeyfiyyetler: isguzarKeyfiyetler,
          streseDavamliliq,
          ascImici,
          qavramaMenimseme,
          ixtisasBiliyi,
          muhendisEtikasi,
          komandaIleIslemeBacarigi
        },
        averageScore,
        comments,
        createdAt,
        updatedAt,
        user: userInfo,
        evaluator
      };
    });

    console.log('User Evaluations - Transformed:', transformedEvaluations);

    return res.status(200).json({
      success: true,
      count: evaluations.length,
      evaluations: transformedEvaluations,
    });
  } catch (error: any) {
    console.error('Get evaluations by user ID error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// @desc    Get evaluation by ID
// @route   GET /api/evaluations/:id
// @access  Private
export const getEvaluationById = async (req: Request, res: Response) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id)
      .populate('userId', 'email firstName lastName')
      .populate('evaluatedBy', 'email firstName lastName');

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation not found',
      });
    }

    // Check if user is admin or the user is requesting their own evaluation
    if (
      req.user?.userType !== 'Admin' && 
      // @ts-ignore - Ignoring type issues with req.user._id
      req.user?._id.toString() !== evaluation.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this evaluation',
      });
    }

    // Transform the data to match the frontend structure
    const { 
      _id, 
      userId, 
      evaluationNumber, 
      evaluatedBy, 
      evaluationDate, 
      davamiyyet,
      isguzarKeyfiyetler,
      streseDavamliliq,
      ascImici,
      qavramaMenimseme,
      ixtisasBiliyi,
      muhendisEtikasi,
      komandaIleIslemeBacarigi,
      averageScore,
      comments,
      createdAt,
      updatedAt
    } = evaluation;

    // Extract user and evaluator data
    const userObj = userId as any;
    const user = userObj && typeof userObj === 'object' && userObj.firstName ? {
      firstName: userObj.firstName || '',
      lastName: userObj.lastName || '',
      email: userObj.email || ''
    } : null;

    const evaluatorObj = evaluatedBy as any;
    const evaluator = evaluatorObj && typeof evaluatorObj === 'object' && evaluatorObj.firstName ? {
      firstName: evaluatorObj.firstName || '',
      lastName: evaluatorObj.lastName || '',
      email: evaluatorObj.email || ''
    } : null;

    const transformedEvaluation = {
      _id,
      userId: userObj && typeof userObj === 'object' && userObj._id ? userObj._id : userId,
      evaluationNumber,
      evaluatorId: evaluatorObj && typeof evaluatorObj === 'object' && evaluatorObj._id ? evaluatorObj._id : evaluatedBy,
      evaluationDate,
      criteria: {
        davamiyyet,
        isGuzarKeyfiyyetler: isguzarKeyfiyetler,
        streseDavamliliq,
        ascImici,
        qavramaMenimseme,
        ixtisasBiliyi,
        muhendisEtikasi,
        komandaIleIslemeBacarigi
      },
      averageScore,
      comments,
      createdAt,
      updatedAt,
      user,
      evaluator
    };

    console.log('Evaluation By ID - Transformed:', transformedEvaluation);

    return res.status(200).json({
      success: true,
      evaluation: transformedEvaluation,
    });
  } catch (error: any) {
    console.error('Get evaluation by ID error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// @desc    Update evaluation
// @route   PUT /api/evaluations/:id
// @access  Private/Admin
export const updateEvaluation = async (req: Request, res: Response) => {
  try {
    console.log('Update evaluation request body:', JSON.stringify(req.body, null, 2));
    
    const { criteria, comments } = req.body;
    
    console.log('Extracted criteria:', JSON.stringify(criteria, null, 2));

    // Find evaluation
    let evaluation = await Evaluation.findById(req.params.id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation not found',
      });
    }

    const userId = evaluation.userId;

    // Update evaluation with detailed error handling
    try {
      const updateData = {
        davamiyyet: criteria.davamiyyet,
        isguzarKeyfiyetler: criteria.isGuzarKeyfiyyetler,
        streseDavamliliq: criteria.streseDavamliliq,
        ascImici: criteria.ascImici,
        qavramaMenimseme: criteria.qavramaMenimseme,
        ixtisasBiliyi: criteria.ixtisasBiliyi,
        muhendisEtikasi: criteria.muhendisEtikasi,
        komandaIleIslemeBacarigi: criteria.komandaIleIslemeBacarigi,
        comments
      };
      
      console.log('Evaluation data to be updated:', JSON.stringify(updateData, null, 2));
      
      // Önce değerlendirmeyi bul
      evaluation = await Evaluation.findById(req.params.id);
      
      if (!evaluation) {
        return res.status(404).json({
          success: false,
          message: 'Evaluation not found',
        });
      }
      
      // Değerlendirme alanlarını güncelle
      evaluation.davamiyyet = criteria.davamiyyet;
      evaluation.isguzarKeyfiyetler = criteria.isGuzarKeyfiyyetler;
      evaluation.streseDavamliliq = criteria.streseDavamliliq;
      evaluation.ascImici = criteria.ascImici;
      evaluation.qavramaMenimseme = criteria.qavramaMenimseme;
      evaluation.ixtisasBiliyi = criteria.ixtisasBiliyi;
      evaluation.muhendisEtikasi = criteria.muhendisEtikasi;
      evaluation.komandaIleIslemeBacarigi = criteria.komandaIleIslemeBacarigi;
      evaluation.comments = comments;
      
      // Değerlendirmeyi kaydet (bu save middleware'i tetikleyecek)
      await evaluation.save();

      // Update user's average score
      await updateUserAverageScore(userId);

      // Transform the updated evaluation to match the frontend structure
      const updatedEvaluation = await Evaluation.findById(req.params.id)
        .populate('userId', 'email firstName lastName')
        .populate('evaluatedBy', 'email firstName lastName');

      if (!updatedEvaluation) {
        return res.status(404).json({
          success: false,
          message: 'Updated evaluation not found',
        });
      }

      const { 
        _id, 
        evaluationNumber, 
        evaluatedBy, 
        evaluationDate, 
        davamiyyet,
        isguzarKeyfiyetler,
        streseDavamliliq,
        ascImici,
        qavramaMenimseme,
        ixtisasBiliyi,
        muhendisEtikasi,
        komandaIleIslemeBacarigi,
        averageScore,
        createdAt,
        updatedAt
      } = updatedEvaluation;

      // Extract user and evaluator data
      const userObj = updatedEvaluation.userId as any;
      const user = userObj && typeof userObj === 'object' && userObj.firstName ? {
        firstName: userObj.firstName || '',
        lastName: userObj.lastName || '',
        email: userObj.email || ''
      } : null;

      const evaluatorObj = evaluatedBy as any;
      const evaluator = evaluatorObj && typeof evaluatorObj === 'object' && evaluatorObj.firstName ? {
        firstName: evaluatorObj.firstName || '',
        lastName: evaluatorObj.lastName || '',
        email: evaluatorObj.email || ''
      } : null;

      const transformedEvaluation = {
        _id,
        userId,
        evaluationNumber,
        evaluatorId: evaluatorObj && typeof evaluatorObj === 'object' && evaluatorObj._id ? evaluatorObj._id : evaluatedBy,
        evaluationDate,
        criteria: {
          davamiyyet,
          isGuzarKeyfiyyetler: isguzarKeyfiyetler,
          streseDavamliliq,
          ascImici,
          qavramaMenimseme,
          ixtisasBiliyi,
          muhendisEtikasi,
          komandaIleIslemeBacarigi
        },
        averageScore,
        comments,
        createdAt,
        updatedAt,
        user,
        evaluator
      };

      console.log('Updated Evaluation - Transformed:', transformedEvaluation);

      return res.status(200).json({
        success: true,
        evaluation: transformedEvaluation,
      });
    } catch (updateError: any) {
      console.error('Error updating evaluation document:', updateError);
      return res.status(400).json({
        success: false,
        message: `Error updating evaluation: ${updateError.message}`,
        errors: updateError.errors
      });
    }
  } catch (error: any) {
    console.error('Update evaluation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// @desc    Delete evaluation
// @route   DELETE /api/evaluations/:id
// @access  Private/Admin
export const deleteEvaluation = async (req: Request, res: Response) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation not found',
      });
    }

    const userId = evaluation.userId;

    await Evaluation.findByIdAndDelete(req.params.id);

    // Update user's average score
    await updateUserAverageScore(userId);

    return res.status(200).json({
      success: true,
      data: {},
      message: 'Evaluation deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete evaluation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// Helper function to update user's average score
const updateUserAverageScore = async (userId: mongoose.Types.ObjectId) => {
  try {
    // Get all evaluations for the user
    const evaluations = await Evaluation.find({ userId });
    
    if (evaluations.length === 0) {
      // If no evaluations, set evaluation average score to undefined
      await User.findByIdAndUpdate(userId, { evaluationAverageScore: undefined });
      return;
    }
    
    // Calculate average score from all evaluations
    const totalScore = evaluations.reduce((sum, evaluation) => sum + evaluation.averageScore, 0);
    const evaluationAverageScore = parseFloat((totalScore / evaluations.length).toFixed(2));
    
    // Update user's evaluation average score
    await User.findByIdAndUpdate(userId, { evaluationAverageScore });
    
    console.log(`Updated user ${userId} evaluation average score to ${evaluationAverageScore}`);
  } catch (error) {
    console.error('Error updating user evaluation average score:', error);
  }
}; 