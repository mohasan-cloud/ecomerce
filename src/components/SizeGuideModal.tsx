"use client";

import { Dialog, Transition } from "@/app/headlessui";
import React, { FC, Fragment } from "react";
import ButtonClose from "@/shared/ButtonClose/ButtonClose";

export interface SizeGuideModalProps {
  show: boolean;
  onClose: () => void;
  productName: string;
  sizes?: Array<{
    id: number;
    name: string | null;
    description?: string | null;
    measurements?: string | null;
  }>;
}

const SizeGuideModal: FC<SizeGuideModalProps> = ({
  show,
  onClose,
  productName,
  sizes = [],
}) => {
  // Use database measurements if available, otherwise use default chart
  const hasDbMeasurements = sizes && sizes.length > 0 && sizes.some(s => s.measurements);
  
  const defaultSizeChart = [
    { size: "XS", chest: "30-32", waist: "24-26", hips: "33-35" },
    { size: "S", chest: "32-34", waist: "26-28", hips: "35-37" },
    { size: "M", chest: "36-38", waist: "28-30", hips: "37-39" },
    { size: "L", chest: "40-42", waist: "32-34", hips: "41-43" },
    { size: "XL", chest: "44-46", waist: "36-38", hips: "45-47" },
    { size: "XXL", chest: "48-50", waist: "40-42", hips: "49-51" },
  ];

  // Filter to show only available sizes
  const availableSizes = sizes?.map(s => s.name).filter(Boolean) || [];
  const filteredSizeChart = hasDbMeasurements 
    ? sizes?.filter(s => s.measurements).map(s => {
        // Parse measurements string like "Chest: 32-34 inches"
        const measurements = s.measurements || "";
        return {
          size: s.name || "",
          measurements: measurements,
        };
      }) || []
    : availableSizes.length > 0 
      ? defaultSizeChart.filter(item => availableSizes.includes(item.size))
      : defaultSizeChart;

  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={onClose}
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
            <div className="inline-block py-8 w-full max-w-3xl">
              <div className="inline-flex flex-col w-full text-left align-middle transition-all transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 dark:border dark:border-neutral-700 dark:text-neutral-100 shadow-xl">
                <div className="relative flex-shrink-0 px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 text-center">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100">
                    Size Guide - {productName}
                  </h3>
                  <span className="absolute left-3 top-3">
                    <ButtonClose onClick={onClose} />
                  </span>
                </div>

                <div className="px-6 py-6">
                  {/* Available Sizes */}
                  {sizes.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                        Available Sizes for this Product:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {sizes.map((size) => (
                          <span
                            key={size.id}
                            className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium"
                          >
                            {size.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size Chart */}
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                      Size Chart:
                    </h4>
                    <div className="overflow-x-auto">
                      {hasDbMeasurements ? (
                        // Show database measurements with description
                        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                          <thead className="bg-neutral-50 dark:bg-neutral-800">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                Size
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                Description
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                Measurements
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
                            {sizes.filter(s => s.measurements).map((size) => (
                              <tr key={size.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                  {size.name}
                                </td>
                                <td className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                                  {size.description || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                                  {size.measurements}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : sizes.some(s => s.description) ? (
                        // Show sizes with description if no measurements
                        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                          <thead className="bg-neutral-50 dark:bg-neutral-800">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                Size
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                Description
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
                            {sizes.map((size) => (
                              <tr key={size.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                  {size.name}
                                </td>
                                <td className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                                  {size.description || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        // Show default chart
                        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                          <thead className="bg-neutral-50 dark:bg-neutral-800">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                Size
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                Chest
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                Waist
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                Hips
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
                            {filteredSizeChart.map((item: any, index: number) => (
                              <tr key={index} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                  {item.size}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                                  {item.chest}"
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                                  {item.waist}"
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                                  {item.hips}"
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  {/* Measurement Tips */}
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                      How to Measure:
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                      <li>• <strong>Chest:</strong> Measure around the fullest part of your chest</li>
                      <li>• <strong>Waist:</strong> Measure around your natural waistline</li>
                      <li>• <strong>Hips:</strong> Measure around the fullest part of your hips</li>
                    </ul>
                  </div>

                  {/* Note */}
                  <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400 italic">
                    * All measurements are in inches. For the best fit, compare these measurements with your own.
                  </p>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SizeGuideModal;

