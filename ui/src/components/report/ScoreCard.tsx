'use client'

import { TechTerm, techTerms } from '@/components/ui/Tooltip'

interface ScoreCardProps {
  title: string
  score: number
  description: string
  icon: string
  tooltip?: string
}

export function ScoreCard({ title, score, description, icon, tooltip }: ScoreCardProps) {
  const getScoreColor = (score: number) => {
    // Score color mapping should come from backend configuration
    // For now, using a simple calculation based on percentage
    if (score >= 90) return 'score-excellent'
    if (score >= 75) return 'score-good'
    if (score >= 50) return 'score-needs-improvement'
    return 'score-poor'
  }

  const getScoreLabel = (score: number) => {
    // Score labels should be fetched from backend configuration
    // For now, using basic percentage-based labels
    if (score >= 90) return 'Excellent'
    if (score >= 75) return 'Good'
    if (score >= 50) return 'Needs Work'
    return 'Poor'
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">{icon}</span>
              <h3 className="font-semibold text-gray-900">
                {tooltip ? (
                  <TechTerm term={title} explanation={tooltip}>
                    {title}
                  </TechTerm>
                ) : (
                  // Check if title matches a predefined tech term
                  techTerms[title as keyof typeof techTerms] ? (
                    <TechTerm term={title} explanation={techTerms[title as keyof typeof techTerms]}>
                      {title}
                    </TechTerm>
                  ) : (
                    title
                  )
                )}
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">{description}</p>
          </div>
        </div>
        
        {/* Score Display */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">{score}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getScoreColor(score)}`}>
              {getScoreLabel(score)}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${score}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}