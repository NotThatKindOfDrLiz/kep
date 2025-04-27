import React, { useState, FormEvent } from 'react';

interface SubmitFormProps {
  onSubmit: (content: string) => void;
}

const SubmitForm: React.FC<SubmitFormProps> = ({ onSubmit }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent('');
    } catch (error) {
      console.error('Failed to submit agenda item:', error);
      // You can add a toast/error notification here later
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <textarea
        id="content"
        placeholder="Enter your agenda item..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="border rounded p-2 w-full min-h-[120px] dark:bg-gray-700 dark:text-white"
        required
        aria-required="true"
      />
      <button
        type="submit"
        disabled={isSubmitting || !content.trim()}
        className="bg-blue-600 text-white rounded p-2 hover:bg-blue-700 dark:bg-blue-500"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Agenda Item'}
      </button>
    </form>
  );
};

export default SubmitForm;
