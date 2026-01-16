import { Dialog, Transition } from "@/app/headlessui";
import { StarIcon } from "@heroicons/react/24/solid";
import ReviewItem from "@/components/ReviewItem";
import SortOrderFilter from "@/components/SectionGridMoreExplore/SortOrderFilter";
import React, { FC, Fragment } from "react";
import ButtonClose from "@/shared/ButtonClose/ButtonClose";

export interface ModalViewAllReviewsProps {
  show: boolean;
  onCloseModalViewAllReviews: () => void;
  productSlug: string;
  reviews: any[];
  reviewStats: {
    averageRating: number;
    totalReviews: number;
  };
}

const ModalViewAllReviews: FC<ModalViewAllReviewsProps> = ({
  show,
  onCloseModalViewAllReviews,
  productSlug,
  reviews,
  reviewStats,
}) => {
  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={onCloseModalViewAllReviews}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as="div"
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            className="fixed inset-0 bg-black bg-opacity-40"
          />

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block py-8 h-screen w-full max-w-5xl">
              <div className="inline-flex pb-2 flex-col w-full text-left align-middle transition-all transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 dark:border dark:border-neutral-700 dark:text-neutral-100 shadow-xl h-full">
                <div className="relative flex-shrink-0 px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 text-center">
                  <h3
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                    id="headlessui-dialog-title-70"
                  >
                    All Customer Reviews
                  </h3>
                  <span className="absolute left-3 top-3">
                    <ButtonClose onClick={onCloseModalViewAllReviews} />
                  </span>
                </div>
                <div className="px-8 my-5 flex justify-between flex-wrap items-center">
                  <h2 className="text-xl sm:text-2xl font-semibold flex items-center">
                    <StarIcon className="w-7 h-7 mb-0.5 text-yellow-500" />
                    <span className="ml-1.5 text-neutral-900 dark:text-neutral-100">
                      {Number(reviewStats.averageRating).toFixed(1)} · {reviewStats.totalReviews} Review{reviewStats.totalReviews !== 1 ? 's' : ''}
                    </span>
                  </h2>
                </div>
                <div className="px-8 py-8 border-t border-slate-200 dark:border-slate-700 overflow-auto grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-10">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <ReviewItem key={review.id} data={review} />
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-12 text-slate-500 dark:text-slate-400">
                      No reviews available yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ModalViewAllReviews;
