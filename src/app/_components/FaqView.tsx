"use client";
import React, { useState, useEffect } from "react";
import { api } from "~/trpc/react";

interface FaqProps {
  isAdmin: boolean;
}

const FaqView: React.FC<FaqProps> = ({ isAdmin }) => {
  const { data: initialFaqs, isLoading, isError } = api.faqs.listAllFaqs.useQuery();
  const createFaqMutation = api.faqs.createNewFaq.useMutation();
  const deleteFaqMutation = api.faqs.deleteFaq.useMutation();
  const editFaqMutation = api.faqs.updateFaq.useMutation();
  
  const [faqs, setFaqs] = useState(initialFaqs || []);
  const [showForm, setShowForm] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  // Update the local FAQ list when initialFaqs changes
  useEffect(() => {
    if (initialFaqs) {
      setFaqs(initialFaqs);
    }
  }, [initialFaqs]);

  const handleCreateFaq = async () => {
    try {
      const newFaq = await createFaqMutation.mutateAsync({ question, answer });
      setFaqs([...faqs, newFaq]); // Add the new FAQ to the existing list
      setQuestion(''); // Clear the input fields after successful submission
      setAnswer('');
      setShowForm(false); // Hide the form after submission
    } catch (error) {
      console.error("Error creating FAQ:", error);
    }
  };

  const handleFaqDeletion = async (faqId: string) => {
    try {
      await deleteFaqMutation.mutateAsync({ id: faqId });
      setFaqs(faqs.filter((faq) => faq.id !== faqId)); // Remove the deleted FAQ from the list
    } catch (error) {
      console.error("Error deleting FAQ:", error);
    }
  };

  const handleFaqUpdation = async (faqId: string) => {
    try {
      await editFaqMutation.mutateAsync({ id: faqId, question, answer });
      setFaqs(
        faqs.map((faq) =>
          faq.id === faqId ? { ...faq, question, answer } : faq
        )
      ); // Update the FAQ in the list
      setEditingFaqId(null); // Exit editing mode after update
      setQuestion('');
      setAnswer('');
    } catch (error) {
      console.error("Error updating FAQ:", error);
    }
  };

  const handleEditClick = (faqId: string, currentQuestion: string, currentAnswer: string) => {
    setEditingFaqId(faqId); // Set the ID of the FAQ being edited
    setQuestion(currentQuestion); // Pre-fill the question in the form
    setAnswer(currentAnswer); // Pre-fill the answer in the form
  };

  if (isLoading) return <p>Loading FAQs...</p>;
  if (isError) return <p>Error fetching FAQs</p>;

  return (
    <div className="mx-12 py-12">
      <h1 className="py-8 font-bold">Frequently Asked Questions</h1>
      {faqs.map((faq) => (
        <div key={faq.id} style={{ marginBottom: "20px" }}>
          <hr />
          {/* Flex container for question and action buttons */}
          <div className="flex justify-between items-center py-4">
            <h3 className="font-medium">{faq.question}</h3>
            {isAdmin && (
              <div className="flex space-x-2">
                <button
                  className="p-2 bg-gray-600 text-white rounded"
                  onClick={() => handleEditClick(faq.id, faq.question, faq.answer)}
                >
                  Edit
                </button>
                <button
                  className="p-2 bg-red-600 text-white rounded"
                  onClick={() => handleFaqDeletion(faq.id)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Show the edit form if this FAQ is being edited */}
          {editingFaqId === faq.id ? (
            <div className="mb-4">
              <label>
                Question:
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="block border rounded p-2 my-2"
                />
              </label>
              <label>
                Answer:
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="block border rounded p-2 my-2"
                />
              </label>
              <button
                className="p-2 bg-green-600 text-white rounded"
                onClick={() => handleFaqUpdation(faq.id)}
              >
                Save
              </button>
              <button
                className="p-2 bg-gray-400 text-white rounded ml-2"
                onClick={() => setEditingFaqId(null)} // Cancel editing
              >
                Cancel
              </button>
            </div>
          ) : (
            <p className="italic py-4">{faq.answer}</p>
          )}
        </div>
      ))}

      {isAdmin && !editingFaqId && (
        <>
          <button
            className="mt-4 p-4 bg-blue-600 text-white rounded"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "Add new FAQ"}
          </button>

          {showForm && (
            <div style={{ marginTop: "20px" }}>
              <div>
                <label>
                  Question:
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="block border rounded p-2 my-2"
                  />
                </label>
              </div>
              <div>
                <label>
                  Answer:
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="block border rounded p-2 my-2"
                  />
                </label>
              </div>
              <button className="p-2 bg-green-600 text-white rounded" onClick={handleCreateFaq}>
                Submit
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FaqView;