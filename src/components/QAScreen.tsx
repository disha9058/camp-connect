import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, User, ArrowUp } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  askerBatch: string;
  createdAt: string;
  answers: Answer[];
}

interface Answer {
  id: string;
  answer: string;
  answererName: string;
  answererBatch: string;
  createdAt: string;
}

const QAScreen = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswers, setNewAnswers] = useState<{ [key: string]: string }>({});
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentUser();
    fetchQuestions();
  }, []);

  const fetchCurrentUser = async () => {
    if (!auth.currentUser) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setCurrentUser({ id: auth.currentUser.uid, ...userDoc.data() });
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const questionsQuery = query(collection(db, 'questions'), orderBy('createdAt', 'desc'));
      const questionsSnapshot = await getDocs(questionsQuery);
      
      const questionsData = await Promise.all(
        questionsSnapshot.docs.map(async (questionDoc) => {
          const questionData = questionDoc.data();
          
          // Fetch answers for each question
          const answersSnapshot = await getDocs(collection(db, 'questions', questionDoc.id, 'answers'));
          const answers = answersSnapshot.docs.map(answerDoc => ({
            id: answerDoc.id,
            ...answerDoc.data()
          })) as Answer[];
          
          return {
            id: questionDoc.id,
            ...questionData,
            answers
          } as Question;
        })
      );
      
      setQuestions(questionsData);
    } catch (error) {
      toast({ title: "Failed to fetch questions", variant: "destructive" });
    }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !currentUser) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'questions'), {
        question: newQuestion,
        askerBatch: currentUser.batch,
        createdAt: new Date().toISOString(),
      });
      
      setNewQuestion('');
      toast({ title: "Question posted anonymously!" });
      fetchQuestions();
    } catch (error) {
      toast({ title: "Failed to post question", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleSubmitAnswer = async (questionId: string) => {
    const answerText = newAnswers[questionId];
    if (!answerText?.trim() || !currentUser) return;

    try {
      await addDoc(collection(db, 'questions', questionId, 'answers'), {
        answer: answerText,
        answererName: currentUser.name,
        answererBatch: currentUser.batch,
        createdAt: new Date().toISOString(),
      });
      
      setNewAnswers({ ...newAnswers, [questionId]: '' });
      toast({ title: "Answer posted successfully!" });
      fetchQuestions();
    } catch (error) {
      toast({ title: "Failed to post answer", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Anonymous Q&A</h1>
          <p className="text-white/80">Ask questions and help others anonymously</p>
        </div>

        {/* Post Question Form - Only for Juniors */}
        {currentUser?.batch === 'junior' && (
          <Card className="mb-6 backdrop-blur-lg bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Ask a Question Anonymously
              </CardTitle>
              <CardDescription>Your identity will remain anonymous</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitQuestion} className="space-y-4">
                <Textarea
                  placeholder="What would you like to ask? (e.g., How to prepare for internships?, Best resources for learning React?, etc.)"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="min-h-[100px]"
                  required
                />
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  disabled={loading}
                >
                  {loading ? "Posting..." : "Post Question Anonymously"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Questions Feed */}
        <div className="space-y-6">
          {questions.map((question) => (
            <Card key={question.id} className="backdrop-blur-lg bg-white/90">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-lg font-medium mb-2">{question.question}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        Anonymous {question.askerBatch}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(question.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Existing Answers */}
                {question.answers.length > 0 && (
                  <div className="mb-4 space-y-3">
                    <h4 className="font-medium text-gray-700">Answers:</h4>
                    {question.answers.map((answer) => (
                      <div key={answer.id} className="bg-gray-50 p-4 rounded-lg">
                        <p className="mb-2">{answer.answer}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          <span>{answer.answererName}</span>
                          <Badge variant="outline" className="text-xs">
                            {answer.answererBatch}
                          </Badge>
                          <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Answer Input - Only for Seniors */}
                {currentUser?.batch === 'senior' && (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Share your advice or answer..."
                      value={newAnswers[question.id] || ''}
                      onChange={(e) => setNewAnswers({ ...newAnswers, [question.id]: e.target.value })}
                      className="min-h-[80px]"
                    />
                    <Button
                      onClick={() => handleSubmitAnswer(question.id)}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      disabled={!newAnswers[question.id]?.trim()}
                    >
                      <ArrowUp className="w-4 h-4 mr-2" />
                      Post Answer
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {questions.length === 0 && (
          <Card className="backdrop-blur-lg bg-white/90">
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No questions yet. Be the first to ask!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QAScreen;
