const { User, Category, Post, Comment } = require('../../database');

const seedData = async () => {
  try {
    console.log('Seeding database with sample data...');

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@blogplatform.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      emailVerified: true,
      bio: 'Platform administrator'
    });

    // Create author user
    const authorUser = await User.create({
      username: 'johndoe',
      email: 'john@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'author',
      emailVerified: true,
      bio: 'Passionate writer and tech enthusiast'
    });

    // Create regular user
    const regularUser = await User.create({
      username: 'janedoe',
      email: 'jane@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'user',
      emailVerified: true,
      bio: 'Blog reader and commenter'
    });

    console.log('✓ Users created');

    // Create categories
    const techCategory = await Category.create({
      name: 'Technology',
      slug: 'technology',
      description: 'Latest tech news and trends',
      color: '#007bff'
    });

    const lifestyleCategory = await Category.create({
      name: 'Lifestyle',
      slug: 'lifestyle',
      description: 'Life tips and personal stories',
      color: '#28a745'
    });

    const tutorialCategory = await Category.create({
      name: 'Tutorials',
      slug: 'tutorials',
      description: 'Step-by-step guides and how-tos',
      color: '#ffc107'
    });

    console.log('✓ Categories created');

    // Create sample posts
    const post1 = await Post.create({
      title: 'Getting Started with Node.js and Express',
      slug: 'getting-started-with-nodejs-and-express',
      excerpt: 'Learn how to build web applications with Node.js and Express framework.',
      content: `
        <h2>Introduction to Node.js</h2>
        <p>Node.js is a powerful JavaScript runtime built on Chrome's V8 JavaScript engine. It allows you to run JavaScript on the server side, making it possible to build full-stack applications using a single programming language.</p>
        
        <h2>Setting Up Express</h2>
        <p>Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.</p>
        
        <pre><code>npm install express</code></pre>
        
        <h2>Creating Your First Server</h2>
        <p>Here's how to create a basic Express server:</p>
        
        <pre><code>const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});</code></pre>
        
        <p>This tutorial covers the basics of getting started with Node.js and Express. In the next parts, we'll explore more advanced features and best practices.</p>
      `,
      status: 'published',
      publishedAt: new Date(),
      authorId: authorUser.id,
      categoryId: tutorialCategory.id,
      tags: ['nodejs', 'express', 'javascript', 'tutorial'],
      seoTitle: 'Node.js Express Tutorial - Complete Beginner Guide',
      seoDescription: 'Complete guide to getting started with Node.js and Express. Learn to build web applications step by step.',
      seoKeywords: ['nodejs', 'express', 'tutorial', 'javascript', 'web development'],
      allowComments: true,
      isFeatured: true
    });

    const post2 = await Post.create({
      title: 'The Future of Web Development: Trends to Watch in 2024',
      slug: 'future-of-web-development-trends-2024',
      excerpt: 'Explore the emerging trends and technologies shaping the future of web development.',
      content: `
        <h2>Introduction</h2>
        <p>The web development landscape is constantly evolving, with new technologies and frameworks emerging regularly. As we progress through 2024, several trends are shaping the future of how we build and interact with web applications.</p>
        
        <h2>Key Trends to Watch</h2>
        
        <h3>1. AI-Powered Development Tools</h3>
        <p>Artificial Intelligence is revolutionizing how developers write code, with tools like GitHub Copilot and ChatGPT becoming integral parts of the development workflow.</p>
        
        <h3>2. Serverless Architecture</h3>
        <p>Serverless computing continues to gain traction, allowing developers to focus on code without worrying about infrastructure management.</p>
        
        <h3>3. Progressive Web Apps (PWAs)</h3>
        <p>PWAs are bridging the gap between web and native applications, providing app-like experiences through web browsers.</p>
        
        <h3>4. WebAssembly (WASM)</h3>
        <p>WebAssembly is enabling high-performance applications in the browser, opening up new possibilities for web-based software.</p>
        
        <h2>Conclusion</h2>
        <p>Staying current with these trends is crucial for developers who want to remain competitive in the ever-changing tech landscape.</p>
      `,
      status: 'published',
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      authorId: authorUser.id,
      categoryId: techCategory.id,
      tags: ['web development', 'trends', '2024', 'technology'],
      seoTitle: 'Web Development Trends 2024 - Future Technologies',
      seoDescription: 'Discover the latest web development trends and technologies that will shape the industry in 2024.',
      allowComments: true,
      isFeatured: false
    });

    const post3 = await Post.create({
      title: 'Building a Productive Home Office Setup',
      slug: 'building-productive-home-office-setup',
      excerpt: 'Tips and tricks for creating a productive and comfortable home office environment.',
      content: `
        <h2>The Importance of a Good Workspace</h2>
        <p>With remote work becoming more common, having a well-designed home office is crucial for productivity and well-being.</p>
        
        <h2>Essential Elements</h2>
        
        <h3>Ergonomic Furniture</h3>
        <p>Invest in a good chair and desk that support proper posture and reduce strain during long work sessions.</p>
        
        <h3>Proper Lighting</h3>
        <p>Natural light is best, but supplement with task lighting to reduce eye strain and maintain alertness.</p>
        
        <h3>Technology Setup</h3>
        <p>Ensure you have reliable internet, a good monitor setup, and all necessary peripherals within easy reach.</p>
        
        <h3>Organization Systems</h3>
        <p>Keep your workspace clutter-free with proper storage solutions and organizational tools.</p>
        
        <h2>Creating Boundaries</h2>
        <p>Establish clear boundaries between work and personal life, even when working from home.</p>
      `,
      status: 'published',
      publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
      authorId: authorUser.id,
      categoryId: lifestyleCategory.id,
      tags: ['home office', 'productivity', 'remote work', 'lifestyle'],
      allowComments: true,
      isFeatured: false
    });

    console.log('✓ Posts created');

    // Create sample comments
    await Comment.create({
      content: 'Great tutorial! This really helped me understand the basics of Express.',
      postId: post1.id,
      authorId: regularUser.id,
      status: 'approved'
    });

    await Comment.create({
      content: 'Very insightful article about web development trends. AI tools are definitely game-changers.',
      postId: post2.id,
      authorId: regularUser.id,
      status: 'approved'
    });

    await Comment.create({
      content: 'Thanks for sharing these productivity tips. I\'m definitely going to reorganize my workspace.',
      postId: post3.id,
      authorId: regularUser.id,
      status: 'approved'
    });

    console.log('✓ Comments created');

    console.log('Database seeded successfully!');
    console.log('\nSample accounts created:');
    console.log('Admin: admin@blogplatform.com / admin123');
    console.log('Author: john@example.com / password123');
    console.log('User: jane@example.com / password123');

  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  }
};

if (require.main === module) {
  seedData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedData;