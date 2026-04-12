import { getWordPressPage } from "../lib/wordpress-api";
import { formatWordPressAccordions } from "../lib/formatters";

export default async function Contact() {
  const pageData = await getWordPressPage("contact");

  return (
    <main className="min-h-screen max-w-[1024px] mx-auto ">
      <div className="pt-20 px-4 sm:px-[50px] flex flex-col gap-4 ">
        <span className="text-2xl text-left block">
          {pageData?.title || "Contact Us"}
        </span>
        
        {pageData?.contentHtml ? (
          <div 
            className="product-description max-w-full"
            dangerouslySetInnerHTML={{ __html: formatWordPressAccordions(pageData.contentHtml) }} 
          />
        ) : (
          <p className="text-left text-gray-500">Content coming soon...</p>
        )}
      </div>
    </main>
  );
}
