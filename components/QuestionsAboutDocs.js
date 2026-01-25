import ButtonSupport from "@/components/ButtonSupport";

export default function QuestionsAboutDocs({ documentName }) {

  return (
    <div className="prose mt-12 border-t border-base-content/10 py-12 text-base flex items-center gap-2">
      <span className="mr-1">Questions about this {documentName}?</span>
      <ButtonSupport className="inline-flex" text="Contact us"/>
    </div>
  );

}