'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Target,
  Plus,
  Edit,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Zap,
  Award,
  Settings,
  Activity,
  ArrowRight,
  AlertCircle as Alert
} from 'lucide-react';

interface PerformanceGoal {
  id: string;
  title: string;
  description: string;
  metric: 'performance' | 'seo' | 'security' | 'accessibility' | 'loadTime' | 'fcp' | 'lcp' | 'cls';
  targetValue: number;
  currentValue: number;
  baselineValue: number;
  targetDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'not-started' | 'in-progress' | 'at-risk' | 'completed' | 'overdue';
  category: 'performance' | 'user-experience' | 'seo' | 'technical' | 'business';
  estimatedEffort: '1-2 days' | '1 week' | '2-4 weeks' | '1-3 months' | '3+ months';
  impact: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  milestones: Array<{
    id: string;
    title: string;
    targetDate: string;
    completed: boolean;
    completedDate?: string;
  }>;
  historicalData: Array<{
    date: string;
    value: number;
    note?: string;
  }>;
}

interface PerformanceGoalTrackerProps {
  goals: PerformanceGoal[];
  onCreateGoal?: (goal: Omit<PerformanceGoal, 'id'>) => void;
  onUpdateGoal?: (goalId: string, updates: Partial<PerformanceGoal>) => void;
  onDeleteGoal?: (goalId: string) => void;
  className?: string;
}

// Goal progress chart component
const GoalProgressChart: React.FC<{
  goal: PerformanceGoal;
  height?: number;
}> = ({ goal, height = 100 }) => {
  const chartWidth = 300;
  const padding = { top: 10, right: 20, bottom: 20, left: 40 };
  const chartInnerWidth = chartWidth - padding.left - padding.right;
  const chartInnerHeight = height - padding.top - padding.bottom;

  const minValue = Math.min(goal.baselineValue, goal.targetValue, goal.currentValue);
  const maxValue = Math.max(goal.baselineValue, goal.targetValue, goal.currentValue);
  const valueRange = maxValue - minValue || 1;

  const getYPosition = (value: number) => {
    return padding.top + ((maxValue - value) / valueRange) * chartInnerHeight;
  };

  const progress = Math.abs((goal.currentValue - goal.baselineValue) / (goal.targetValue - goal.baselineValue)) * 100;
  const daysRemaining = Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysRemaining < 0;

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-900">Progress</span>
        <span className="text-xs text-gray-500">
          {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`}
        </span>
      </div>
      
      <svg width={chartWidth} height={height} className="mb-2">
        {/* Background area */}
        <rect
          x={padding.left}
          y={padding.top}
          width={chartInnerWidth}
          height={chartInnerHeight}
          fill="#f9fafb"
          stroke="#e5e7eb"
          rx="4"
        />
        
        {/* Target line */}
        <line
          x1={padding.left}
          y1={getYPosition(goal.targetValue)}
          x2={chartWidth - padding.right}
          y2={getYPosition(goal.targetValue)}
          stroke="#10b981"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
        
        {/* Baseline line */}
        <line
          x1={padding.left}
          y1={getYPosition(goal.baselineValue)}
          x2={chartWidth - padding.right}
          y2={getYPosition(goal.baselineValue)}
          stroke="#6b7280"
          strokeWidth="2"
          opacity="0.5"
        />
        
        {/* Historical progress line */}
        {goal.historicalData.length > 1 && (
          <path
            d={goal.historicalData.map((point, index) => {
              const x = padding.left + (index / (goal.historicalData.length - 1)) * chartInnerWidth;
              const y = getYPosition(point.value);
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}
        
        {/* Current value indicator */}
        <circle
          cx={chartWidth - padding.right - 10}
          cy={getYPosition(goal.currentValue)}
          r="4"
          fill="#3b82f6"
          stroke="white"
          strokeWidth="2"
        />
        
        {/* Value labels */}
        <text
          x={padding.left - 5}
          y={getYPosition(goal.targetValue) + 4}
          textAnchor="end"
          fontSize="10"
          fill="#10b981"
          fontWeight="bold"
        >
          Target: {goal.targetValue}
        </text>
        
        <text
          x={padding.left - 5}
          y={getYPosition(goal.baselineValue) + 4}
          textAnchor="end"
          fontSize="10"
          fill="#6b7280"
        >
          Baseline: {goal.baselineValue}
        </text>
        
        <text
          x={chartWidth - padding.right + 5}
          y={getYPosition(goal.currentValue) + 4}
          textAnchor="start"
          fontSize="10"
          fill="#3b82f6"
          fontWeight="bold"
        >
          Current: {goal.currentValue}
        </text>
      </svg>
      
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Progress</span>
          <span>{Math.round(Math.max(0, progress))}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              progress >= 100 ? 'bg-green-500' : progress >= 75 ? 'bg-blue-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Goal card component
const GoalCard: React.FC<{
  goal: PerformanceGoal;
  onEdit?: (goal: PerformanceGoal) => void;
  onDelete?: (goalId: string) => void;
  onUpdateStatus?: (goalId: string, status: PerformanceGoal['status']) => void;
}> = ({ goal, onEdit, onDelete, onUpdateStatus }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = (status: PerformanceGoal['status']) => {
    const colors = {
      'not-started': 'text-gray-600 bg-gray-100 border-gray-300',
      'in-progress': 'text-blue-600 bg-blue-100 border-blue-300',
      'at-risk': 'text-yellow-600 bg-yellow-100 border-yellow-300',
      'completed': 'text-green-600 bg-green-100 border-green-300',
      'overdue': 'text-red-600 bg-red-100 border-red-300'
    };
    return colors[status];
  };

  const getPriorityColor = (priority: PerformanceGoal['priority']) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[priority];
  };

  const getImpactIcon = (impact: PerformanceGoal['impact']) => {
    const icons = {
      low: Clock,
      medium: Activity,
      high: TrendingUp,
      critical: Alert
    };
    return icons[impact] || Activity;
  };

  const getCategoryIcon = (category: PerformanceGoal['category']) => {
    const icons = {
      performance: Zap,
      'user-experience': Activity,
      seo: TrendingUp,
      technical: Settings,
      business: Award
    };
    return icons[category] || Target;
  };

  const StatusIcon = goal.status === 'completed' ? CheckCircle2 : 
                    goal.status === 'overdue' ? AlertCircle : 
                    goal.status === 'at-risk' ? AlertCircle : Clock;

  const ImpactIcon = getImpactIcon(goal.impact);
  const CategoryIcon = getCategoryIcon(goal.category);

  // const daysRemaining = Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)); // unused
  const progress = Math.abs((goal.currentValue - goal.baselineValue) / (goal.targetValue - goal.baselineValue)) * 100;
  const completedMilestones = goal.milestones.filter(m => m.completed).length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group"
    >
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-l-4" 
            style={{ borderLeftColor: goal.priority === 'high' ? '#ef4444' : goal.priority === 'medium' ? '#f59e0b' : '#10b981' }}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <CategoryIcon className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                <div className={`w-3 h-3 rounded-full ${getPriorityColor(goal.priority)}`} />
              </div>
              <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
              
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Due {new Date(goal.targetDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ImpactIcon className="h-3 w-3" />
                  <span className="capitalize">{goal.impact} impact</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{goal.estimatedEffort}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className={`${getStatusColor(goal.status)} border text-xs`} variant="outline">
                <StatusIcon className="h-3 w-3 mr-1" />
                {goal.status.replace('-', ' ')}
              </Badge>
              
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="ghost" onClick={() => onEdit?.(goal)}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDelete?.(goal.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Progress overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Target Progress</span>
                <span className="font-medium">{Math.round(Math.max(0, progress))}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    progress >= 100 ? 'bg-green-500' : progress >= 75 ? 'bg-blue-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Milestones</span>
                <span className="font-medium">{completedMilestones}/{goal.milestones.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-purple-500 transition-all duration-500"
                  style={{ width: `${(completedMilestones / goal.milestones.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Current</div>
              <div className="text-xl font-bold text-gray-900">{goal.currentValue}</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600">Target</div>
              <div className="text-xl font-bold text-blue-600">{goal.targetValue}</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-green-600">Improvement</div>
              <div className="text-xl font-bold text-green-600">
                {goal.currentValue > goal.baselineValue ? '+' : ''}
                {(goal.currentValue - goal.baselineValue).toFixed(1)}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs"
            >
              {showDetails ? 'Hide' : 'Show'} Details
              <ArrowRight className={`h-3 w-3 ml-1 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
            </Button>
            
            <div className="flex items-center space-x-2">
              {goal.status !== 'completed' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus?.(goal.id, 'completed')}
                  className="text-xs"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Mark Complete
                </Button>
              )}
              
              <Button size="sm" className="text-xs">
                Update Progress
              </Button>
            </div>
          </div>

          {/* Detailed view */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Progress chart */}
                  <GoalProgressChart goal={goal} />
                  
                  {/* Milestones */}
                  <div className="bg-white rounded-lg border p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Milestones</h4>
                    <div className="space-y-2">
                      {goal.milestones.map((milestone) => (
                        <div
                          key={milestone.id}
                          className={`flex items-center space-x-3 p-2 rounded-lg ${
                            milestone.completed ? 'bg-green-50' : 'bg-gray-50'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <div className="flex-1">
                            <div className={`text-sm font-medium ${
                              milestone.completed ? 'text-green-900 line-through' : 'text-gray-900'
                            }`}>
                              {milestone.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              Due: {new Date(milestone.targetDate).toLocaleDateString()}
                              {milestone.completed && milestone.completedDate && (
                                <span> • Completed: {new Date(milestone.completedDate).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main component
const PerformanceGoalTracker: React.FC<PerformanceGoalTrackerProps> = ({
  goals,
  onCreateGoal,
  onUpdateGoal,
  onDeleteGoal,
  className = ""
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | PerformanceGoal['status']>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | PerformanceGoal['category']>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'progress'>('priority');

  const filteredAndSortedGoals = useMemo(() => {
    let filtered = goals;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(goal => goal.status === filterStatus);
    }
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(goal => goal.category === filterCategory);
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'dueDate':
          return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
        case 'progress':
          const progressA = Math.abs((a.currentValue - a.baselineValue) / (a.targetValue - a.baselineValue));
          const progressB = Math.abs((b.currentValue - b.baselineValue) / (b.targetValue - b.baselineValue));
          return progressB - progressA;
        default:
          return 0;
      }
    });
  }, [goals, filterStatus, filterCategory, sortBy]);

  const goalStats = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter(g => g.status === 'completed').length;
    const inProgress = goals.filter(g => g.status === 'in-progress').length;
    const atRisk = goals.filter(g => g.status === 'at-risk').length;
    const overdue = goals.filter(g => g.status === 'overdue').length;
    
    return { total, completed, inProgress, atRisk, overdue };
  }, [goals]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header and stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Goals</h2>
          <p className="text-gray-600">Track and manage your performance improvement objectives</p>
        </div>
        
        <Button onClick={() => onCreateGoal?.({} as Omit<PerformanceGoal, 'id'>)}>
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{goalStats.total}</div>
            <div className="text-sm text-gray-600">Total Goals</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{goalStats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{goalStats.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{goalStats.atRisk}</div>
            <div className="text-sm text-gray-600">At Risk</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{goalStats.overdue}</div>
            <div className="text-sm text-gray-600">Overdue</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and sorting */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-lg border shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | PerformanceGoal['status'])}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1"
            >
              <option value="all">All</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="at-risk">At Risk</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Category:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as 'all' | PerformanceGoal['category'])}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1"
            >
              <option value="all">All</option>
              <option value="performance">Performance</option>
              <option value="user-experience">User Experience</option>
              <option value="seo">SEO</option>
              <option value="technical">Technical</option>
              <option value="business">Business</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'priority' | 'dueDate' | 'progress')}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1"
          >
            <option value="priority">Priority</option>
            <option value="dueDate">Due Date</option>
            <option value="progress">Progress</option>
          </select>
        </div>
      </div>

      {/* Goals grid */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredAndSortedGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={(goal) => onUpdateGoal?.(goal.id, goal)}
              onDelete={onDeleteGoal}
              onUpdateStatus={(id, status) => onUpdateGoal?.(id, { status })}
            />
          ))}
        </AnimatePresence>
        
        {filteredAndSortedGoals.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No goals found</h3>
            <p className="text-gray-600 mb-4">
              {filterStatus !== 'all' || filterCategory !== 'all'
                ? 'Try adjusting your filters to see more goals.'
                : 'Create your first performance goal to get started.'}
            </p>
            {(filterStatus !== 'all' || filterCategory !== 'all') && (
              <Button variant="outline" onClick={() => { setFilterStatus('all'); setFilterCategory('all'); }}>
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceGoalTracker;