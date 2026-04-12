import { getWordPressPage } from "../lib/wordpress-api";

export default async function About() {
  const pageData = await getWordPressPage("about");

  return (
    <main className="min-h-screen max-w-[1024px] mx-auto ">
      <div className="pt-20 px-4 sm:px-[50px] flex flex-col gap-4 ">
        <span className="text-2xl  text-left block">
          {pageData?.title || "About Us"}
        </span>

        {pageData?.contentHtml ? (
          <div
            className="product-description max-w-[400px] "
            dangerouslySetInnerHTML={{ __html: pageData.contentHtml }}
          />
        ) : (
          <p className="text-center text-gray-500">Content coming soon...</p>
        )}
      </div>
    </main>
  );
}
