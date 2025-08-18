import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';

import Layout from '@/layouts/Layout';
import PostCard from '@/components/blog/PostCard';
import CategoryList from '@/components/blog/CategoryList';
import FeaturedPosts from '@/components/blog/FeaturedPosts';
import NewsletterSignup from '@/components/common/NewsletterSignup';
import { Post, Category } from '@/types';
import { postsAPI, categoriesAPI } from '@/utils/api';

interface HomePageProps {
  featuredPosts: Post[];
  recentPosts: Post[];
  categories: Category[];
  popularPosts: Post[];
}

export default function HomePage({
  featuredPosts,
  recentPosts,
  categories,
  popularPosts,
}: HomePageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredPosts = selectedCategory
    ? recentPosts.filter(post => post.category?.slug === selectedCategory)
    : recentPosts;

  return (
    <Layout>
      <Head>
        <title>Blog Platform - Modern Content Management & Blogging</title>
        <meta
          name="description"
          content="Discover amazing content on our modern blog platform. Read the latest posts, engage with authors, and join our community of writers and readers."
        />
        <meta name="keywords" content="blog, articles, content, writing, community" />
        <meta property="og:title" content="Blog Platform - Modern Content Management & Blogging" />
        <meta
          property="og:description"
          content="Discover amazing content on our modern blog platform. Read the latest posts, engage with authors, and join our community of writers and readers."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={process.env.NEXT_PUBLIC_SITE_URL} />
        <link rel="canonical" href={process.env.NEXT_PUBLIC_SITE_URL} />
      </Head>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-br from-primary-50 via-white to-primary-50 py-20"
      >
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Welcome to Our{' '}
              <span className="text-gradient">Blog Platform</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-600 mb-8 leading-relaxed"
            >
              Discover amazing stories, insightful articles, and engaging content from our community of passionate writers. Join thousands of readers exploring ideas that matter.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/blog" className="btn-primary btn-lg">
                Explore Articles
              </Link>
              <Link href="/about" className="btn-outline btn-lg">
                Learn More
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="py-16 bg-white"
        >
          <div className="container">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Featured Articles
                </h2>
                <p className="text-gray-600">
                  Hand-picked stories from our editors
                </p>
              </div>
              <Link
                href="/blog?featured=true"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                View all featured →
              </Link>
            </div>
            
            <FeaturedPosts posts={featuredPosts} />
          </div>
        </motion.section>
      )}

      {/* Categories */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.0 }}
        className="py-16 bg-gray-50"
      >
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explore by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find content that interests you most. From technology to lifestyle, we cover a wide range of topics.
            </p>
          </div>
          
          <CategoryList
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
        </div>
      </motion.section>

      {/* Recent Posts */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="py-16 bg-white"
      >
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedCategory ? 'Filtered Posts' : 'Latest Articles'}
              </h2>
              <p className="text-gray-600">
                {selectedCategory
                  ? `Posts in ${categories.find(cat => cat.slug === selectedCategory)?.name}`
                  : 'Fresh content from our writers'}
              </p>
            </div>
            <Link
              href="/blog"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View all posts →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.slice(0, 6).map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </div>
          
          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No posts found in this category yet.
              </p>
              <button
                onClick={() => setSelectedCategory(null)}
                className="btn-primary mt-4"
              >
                Show all posts
              </button>
            </div>
          )}
        </div>
      </motion.section>

      {/* Popular Posts Sidebar */}
      {popularPosts.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="py-16 bg-gray-50"
        >
          <div className="container">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Popular This Week
            </h2>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {popularPosts.slice(0, 4).map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex space-x-4 p-4 bg-white rounded-lg shadow-sm"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="text-primary-600 font-bold text-lg">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="block hover:text-primary-600 transition-colors"
                      >
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {post.viewCount} views • {post.readTime} min read
                        </p>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Newsletter Signup */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.6 }}
        className="py-16 bg-primary-600"
      >
        <div className="container">
          <NewsletterSignup />
        </div>
      </motion.section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Fetch data from API (in production, these would be actual API calls)
    const [featuredPostsRes, recentPostsRes, categoriesRes, popularPostsRes] = await Promise.all([
      // For now, we'll use mock data. In production, these would be API calls
      Promise.resolve({ success: true, data: { posts: [] } }),
      Promise.resolve({ success: true, data: { posts: [] } }),
      Promise.resolve({ success: true, data: { categories: [] } }),
      Promise.resolve({ success: true, data: { posts: [] } }),
    ]);

    // Mock data for demonstration
    const mockCategories: Category[] = [
      {
        id: 1,
        name: 'Technology',
        slug: 'technology',
        description: 'Latest tech trends and innovations',
        color: '#3b82f6',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        postCount: 12,
      },
      {
        id: 2,
        name: 'Lifestyle',
        slug: 'lifestyle',
        description: 'Tips for better living',
        color: '#10b981',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        postCount: 8,
      },
      {
        id: 3,
        name: 'Tutorials',
        slug: 'tutorials',
        description: 'Step-by-step guides',
        color: '#f59e0b',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        postCount: 15,
      },
    ];

    return {
      props: {
        featuredPosts: [],
        recentPosts: [],
        categories: mockCategories,
        popularPosts: [],
      },
      revalidate: 60, // Revalidate every minute
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);

    return {
      props: {
        featuredPosts: [],
        recentPosts: [],
        categories: [],
        popularPosts: [],
      },
      revalidate: 60,
    };
  }
};