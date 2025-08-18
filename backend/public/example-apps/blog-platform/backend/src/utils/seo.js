const { Post, Category, User } = require('../../../database');
const { cache, cacheKeys } = require('./redis');

// Generate sitemap XML
const generateSitemap = async () => {
  try {
    // Check cache first
    const cachedSitemap = await cache.get(cacheKeys.sitemap());
    if (cachedSitemap) {
      return cachedSitemap;
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Get all published posts
    const posts = await Post.findAll({
      where: { status: 'published' },
      attributes: ['slug', 'updatedAt'],
      order: [['updatedAt', 'DESC']]
    });

    // Get all active categories
    const categories = await Category.findAll({
      where: { isActive: true },
      attributes: ['slug', 'updatedAt']
    });

    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add homepage
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}</loc>\n`;
    sitemap += '    <changefreq>daily</changefreq>\n';
    sitemap += '    <priority>1.0</priority>\n';
    sitemap += '  </url>\n';

    // Add blog homepage
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}/blog</loc>\n`;
    sitemap += '    <changefreq>daily</changefreq>\n';
    sitemap += '    <priority>0.9</priority>\n';
    sitemap += '  </url>\n';

    // Add posts
    posts.forEach(post => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
      sitemap += `    <lastmod>${post.updatedAt.toISOString()}</lastmod>\n`;
      sitemap += '    <changefreq>weekly</changefreq>\n';
      sitemap += '    <priority>0.8</priority>\n';
      sitemap += '  </url>\n';
    });

    // Add categories
    categories.forEach(category => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}/category/${category.slug}</loc>\n`;
      sitemap += `    <lastmod>${category.updatedAt.toISOString()}</lastmod>\n`;
      sitemap += '    <changefreq>weekly</changefreq>\n';
      sitemap += '    <priority>0.7</priority>\n';
      sitemap += '  </url>\n';
    });

    sitemap += '</urlset>';

    // Cache sitemap for 1 hour
    await cache.set(cacheKeys.sitemap(), sitemap, 3600);

    return sitemap;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return null;
  }
};

// Generate robots.txt
const generateRobotsTxt = () => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  let robotsTxt = 'User-agent: *\n';
  robotsTxt += 'Allow: /\n';
  robotsTxt += 'Disallow: /admin/\n';
  robotsTxt += 'Disallow: /api/\n';
  robotsTxt += '\n';
  robotsTxt += `Sitemap: ${baseUrl}/sitemap.xml\n`;

  return robotsTxt;
};

// Generate Schema.org structured data for a post
const generatePostSchema = (post, author, category) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.seoDescription,
    image: post.featuredImage ? {
      '@type': 'ImageObject',
      url: post.featuredImage
    } : undefined,
    author: {
      '@type': 'Person',
      name: author.getFullName(),
      url: `${baseUrl}/author/${author.username}`
    },
    publisher: {
      '@type': 'Organization',
      name: process.env.SITE_NAME || 'Blog Platform',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`
      }
    },
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    url: `${baseUrl}/blog/${post.slug}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${post.slug}`
    },
    articleSection: category ? category.name : undefined,
    keywords: post.tags ? post.tags.join(', ') : undefined,
    wordCount: post.content ? post.content.split(/\s+/).length : undefined,
    timeRequired: post.readTime ? `PT${post.readTime}M` : undefined
  };

  // Remove undefined values
  Object.keys(schema).forEach(key => 
    schema[key] === undefined && delete schema[key]
  );

  return schema;
};

// Generate Schema.org structured data for the website
const generateWebsiteSchema = () => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: process.env.SITE_NAME || 'Blog Platform',
    description: process.env.SITE_DESCRIPTION || 'A modern blog platform',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
};

// Generate Schema.org breadcrumb data
const generateBreadcrumbSchema = (breadcrumbs) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${baseUrl}${crumb.path}`
    }))
  };
};

// Generate meta tags for a post
const generatePostMetaTags = (post, author, category) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const siteName = process.env.SITE_NAME || 'Blog Platform';
  
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const url = `${baseUrl}/blog/${post.slug}`;
  const image = post.featuredImage;

  return {
    title: `${title} | ${siteName}`,
    description,
    keywords: post.seoKeywords?.join(', ') || post.tags?.join(', '),
    
    // Open Graph
    'og:title': title,
    'og:description': description,
    'og:type': 'article',
    'og:url': url,
    'og:image': image,
    'og:site_name': siteName,
    'og:locale': 'en_US',
    
    // Twitter Card
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': image,
    'twitter:site': process.env.TWITTER_HANDLE,
    
    // Article specific
    'article:author': author.getFullName(),
    'article:published_time': post.publishedAt || post.createdAt,
    'article:modified_time': post.updatedAt,
    'article:section': category ? category.name : undefined,
    'article:tag': post.tags?.join(','),
    
    // Additional SEO
    canonical: url,
    robots: 'index,follow'
  };
};

// Generate meta tags for category pages
const generateCategoryMetaTags = (category, posts = []) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const siteName = process.env.SITE_NAME || 'Blog Platform';
  
  const title = `${category.name} | ${siteName}`;
  const description = category.description || `Browse posts in ${category.name} category`;
  const url = `${baseUrl}/category/${category.slug}`;

  return {
    title,
    description,
    
    // Open Graph
    'og:title': title,
    'og:description': description,
    'og:type': 'website',
    'og:url': url,
    'og:site_name': siteName,
    
    // Twitter Card
    'twitter:card': 'summary',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:site': process.env.TWITTER_HANDLE,
    
    canonical: url,
    robots: 'index,follow'
  };
};

module.exports = {
  generateSitemap,
  generateRobotsTxt,
  generatePostSchema,
  generateWebsiteSchema,
  generateBreadcrumbSchema,
  generatePostMetaTags,
  generateCategoryMetaTags
};