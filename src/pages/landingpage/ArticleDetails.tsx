import { useParams, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ARTICLES } from "@/types/articleData";

export default function ArticleDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation("landing");

  const article = ARTICLES.find((a) => a.id === Number(id));

  if (!article) {
    return (
      <div className="min-h-screen pt-14 bg-lavender-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Article Not Found
          </h1>
          <button
            onClick={() => navigate("/resources")}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow"
          >
            Back to Resources
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lavender-50">
      {/* Header Image Section */}
      <div className="relative h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[400px] w-full overflow-hidden pt-14 sm:pt-16">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-14 lg:pt-16 pb-8 sm:pb-10 lg:pb-12">
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-block bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
            {article.category}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 text-center px-2">
          {article.title}
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 italic text-center max-w-3xl mx-auto px-2">
          {article.description}
        </p>

        {/* Divider */}
        <div className="w-16 sm:w-20 lg:w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-6 sm:mb-8 rounded-full" />

        {/* Full Content */}
        <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none mb-8 sm:mb-10 lg:mb-12">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base sm:text-lg">
            {article.fullContent}
          </p>
        </div>

        {/* Support Section */}
        <div className="mt-8 sm:mt-10 lg:mt-12 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl border border-purple-100 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 mb-2 text-lg sm:text-xl">
                {t("resources.support.title")}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
                {t("resources.support.description")}
              </p>
              <button
                onClick={() => navigate("/therapy")}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-semibold hover:shadow-lg transition-shadow text-sm sm:text-base"
              >
                {t("resources.support.button")}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 sm:mt-10 lg:mt-12 flex justify-center">
          <button
            onClick={() => navigate("/resources")}
            className="bg-white border-2 border-purple-500 text-purple-600 px-4 py-2 rounded-full font-semibold hover:bg-purple-50 transition-colors shadow-md text-sm sm:text-base"
          >
            Browse More
          </button>
        </div>
      </div>
    </div>
  );
}
