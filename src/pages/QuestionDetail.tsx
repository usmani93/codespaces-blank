import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthContext } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, ThumbsUp, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Question, Answer } from '../types';

export default function QuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuthContext();

  useEffect(() => {
    async function fetchQuestionAndAnswers() {
      if (!id) return;

      const questionDoc = await getDoc(doc(db, 'questions', id));
      if (questionDoc.exists()) {
        setQuestion({ id: questionDoc.id, ...questionDoc.data() } as Question);
      }

      const answersQuery = query(collection(db, 'answers'), where('questionId', '==', id));
      const answersSnapshot = await getDocs(answersQuery);
      const answersData = answersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Answer[];
      setAnswers(answersData);
    }

    fetchQuestionAndAnswers();
  }, [id]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !question) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'answers'), {
        questionId: id,
        body: newAnswer,
        authorId: user.uid,
        authorName: user.displayName,
        authorPhotoURL: user.photoURL,
        createdAt: new Date().getTime(),
        votes: 0,
        isAccepted: false
      });

      setNewAnswer('');
      // Refresh answers
      const answersQuery = query(collection(db, 'answers'), where('questionId', '==', id));
      const answersSnapshot = await getDocs(answersQuery);
      const answersData = answersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Answer[];
      setAnswers(answersData);
    } catch (error) {
      console.error('Error adding answer:', error);
      alert('Failed to post answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!question) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold mb-4">{question.title}</h1>
        
        <div className="flex items-start space-x-4">
          <div className="flex flex-col items-center space-y-2">
            <button className="flex flex-col items-center text-gray-500">
              <ThumbsUp className="h-6 w-6" />
              <span className="text-sm">{question.votes}</span>
            </button>
          </div>

          <div className="flex-1">
            <div className="prose max-w-none">
              <ReactMarkdown>{question.body}</ReactMarkdown>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img
                  src={question.authorPhotoURL || `https://ui-avatars.com/api/?name=${question.authorName}`}
                  alt={question.authorName}
                  className="h-8 w-8 rounded-full"
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

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">{answers.length} Answers</h2>
        
        <div className="space-y-6">
          {answers.map((answer) => (
            <div key={answer.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start space-x-4">
                <div className="flex flex-col items-center space-y-2">
                  <button className="flex flex-col items-center text-gray-500">
                    <ThumbsUp className="h-6 w-6" />
                    <span className="text-sm">{answer.votes}</span>
                  </button>
                  {answer.isAccepted && (
                    <div className="text-green-500">
                      <Check className="h-6 w-6" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="prose max-w-none">
                    <ReactMarkdown>{answer.body}</ReactMarkdown>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img
                        src={answer.authorPhotoURL || `https://ui-avatars.com/api/?name=${answer.authorName}`}
                        alt={answer.authorName}
                        className="h-8 w-8 rounded-full"
                      />
                      <span className="text-sm text-gray-600">{answer.authorName}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      answered {formatDistanceToNow(new Date(answer.createdAt))} ago
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Your Answer</h2>
          
          {user ? (
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                rows={6}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                placeholder="Write your answer here..."
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Post Your Answer'}
              </button>
            </form>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-600">Please sign in to answer this question.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}