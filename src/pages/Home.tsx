import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, ThumbsUp } from 'lucide-react';
import type { Question } from '../types';

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuestions() {
      const q = query(collection(db, 'questions'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const questionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Question[];
      setQuestions(questionsData);
      setLoading(false);
    }

    fetchQuestions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Top Questions</h1>
        <Link
          to="/ask"
          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
        >
          Ask Question
        </Link>
      </div>

      <div className="space-y-4">
        {questions.map((question) => (
          <div key={question.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start space-x-4">
              <div className="flex flex-col items-center space-y-2">
                <button className="flex flex-col items-center text-gray-500">
                  <ThumbsUp className="h-6 w-6" />
                  <span className="text-sm">{question.votes}</span>
                </button>
                <div className="flex items-center space-x-1 text-gray-500">
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-sm">3</span>
                </div>
              </div>

              <div className="flex-1">
                <Link
                  to={`/question/${question.id}`}
                  className="text-xl font-semibold text-blue-600 hover:text-blue-800"
                >
                  {question.title}
                </Link>
                <p className="mt-2 text-gray-600 line-clamp-2">{question.body}</p>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img
                      src={question.authorPhotoURL || `https://ui-avatars.com/api/?name=${question.authorName}`}
                      alt={question.authorName}
                      className="h-6 w-6 rounded-full"
                    />
                    <span className="text-sm text-gray-600">{question.authorName}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    asked {formatDistanceToNow(new Date(question.createdAt))} ago
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}