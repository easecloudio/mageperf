
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalysisCardProps {
  taskId: string;
  url: string;
  date: string;
  score: number;
  grade: string;
}

export function AnalysisCard({ taskId, url, date, score, grade }: AnalysisCardProps) {
  const getGradeColor = (grade: string) => {
    if (grade === "A") return "text-green-500";
    if (grade === "B") return "text-blue-500";
    if (grade === "C") return "text-yellow-500";
    if (grade === "D") return "text-orange-500";
    return "text-red-500";
  };

  return (
    <Link href={`/report/${taskId}`}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="truncate">{url}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Analyzed on</p>
              <p>{new Date(date).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Score</p>
              <p className={`text-2xl font-bold ${getGradeColor(grade)}`}>{score.toFixed(0)} ({grade})</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
