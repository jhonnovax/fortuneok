export default function QuestionsAboutDocs({ documentName }) {

  return (
    <div className="prose mt-12 border-t border-base-content/10 py-12 text-base">
      <span className="mr-1">Questions about this {documentName}?</span>
      <a 
        href={`mailto:support@fortuneok.com?subject=Questions about ${documentName}`} 
        className="underline decoration-base-content/30 underline-offset-2 duration-100 hover:text-primary hover:decoration-primary"
        target="_blank"
        rel="noopener noreferrer"
      >
        Contact us
      </a> 📧
    </div>
  );

}