"use client";

import ProductCard from "@/components/ProductCard";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiProduct } from "@/hooks/useProducts";
import SkeletonProductCard from "@/components/SkeletonProductCard";
import toast from "react-hot-toast";

const AccountSavelists = () => {
  const router = useRouter();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem('auth_token');
      const sessionId = localStorage.getItem('session_id') || 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now();
      
      if (!token && !sessionId) {
        toast.error('Please login to view your wishlist');
        router.push('/login');
        return;
      }

      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        const headers: HeadersInit = {
          'Accept': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        } else {
          headers['X-Session-ID'] = sessionId;
        }

        const response = await fetch(`${apiUrl}/api/wishlist`, {
          headers,
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            // Convert wishlist items to ApiProduct format
            const productList: ApiProduct[] = data.data.map((item: any) => {
              const product = item.product;
              return {
                id: product.id,
                name: product.name,
                slug: product.slug,
                description: product.description || '',
                price: product.price,
                finalPrice: product.finalPrice || product.price,
                discountPercentage: product.discountPercentage || 0,
                discountAmount: product.discountAmount || 0,
                image: product.image || '/images/default-product.png',
                galleryImages: product.galleryImages || [],
                rating: typeof product.rating === 'number' ? product.rating : (typeof product.rating === 'string' ? parseFloat(product.rating) : 0),
                numberOfReviews: product.numberOfReviews || 0,
                status: product.status || null,
                inStock: product.inStock !== undefined ? product.inStock : true,
                isNew: product.isNew || false,
                isFeatured: product.isFeatured || false,
                isBestseller: product.isBestseller || false,
                category: product.category || null,
                subCategory: product.subCategory || null,
                brand: product.brand || null,
                colors: product.colors || [],
                sizes: product.sizes || [],
                hasOffer: product.hasOffer || false,
                offer: product.offer || null,
              } as ApiProduct;
            });
            
            setProducts(productList);
            setWishlistIds(data.data.map((item: any) => item.id));
          }
        } else if (response.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          toast.error('Session expired. Please login again');
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        toast.error('Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [router]);

  const renderSection1 = () => {
    return (
      <div className="space-y-10 sm:space-y-12">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold">
            List of saved products
          </h2>
          {!loading && products.length === 0 && (
            <p className="mt-4 text-neutral-500 dark:text-neutral-400">
              You haven't saved any products yet. Start adding products to your wishlist!
            </p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonProductCard key={index} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} data={product} />
              ))}
            </div>
            {products.length >= 6 && (
              <div className="flex !mt-20 justify-center items-center">
                <ButtonSecondary>Show me more</ButtonSecondary>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-500 dark:text-neutral-400">
              No products in your wishlist yet.
            </p>
          </div>
        )}
      </div>
    );
  };

  return renderSection1();
};

export default AccountSavelists;
