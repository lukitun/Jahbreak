module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 200]
      }
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 200],
        is: /^[a-z0-9-]+$/
      }
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 500]
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 50000]
      }
    },
    featuredImage: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'scheduled', 'archived'),
      defaultValue: 'draft',
      allowNull: false
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: []
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    likesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    commentsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    readTime: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    seoTitle: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 70]
      }
    },
    seoDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 160]
      }
    },
    seoKeywords: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: []
    },
    allowComments: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  }, {
    hooks: {
      beforeCreate: (post) => {
        if (!post.slug && post.title) {
          post.slug = post.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        }
        
        // Calculate reading time (average 200 words per minute)
        if (post.content) {
          const wordCount = post.content.split(/\s+/).length;
          post.readTime = Math.ceil(wordCount / 200);
        }

        // Auto-generate excerpt if not provided
        if (!post.excerpt && post.content) {
          const plainText = post.content.replace(/<[^>]*>/g, '');
          post.excerpt = plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
        }

        // Set published date if status is published
        if (post.status === 'published' && !post.publishedAt) {
          post.publishedAt = new Date();
        }
      },
      beforeUpdate: (post) => {
        if (post.changed('title') && !post.changed('slug')) {
          post.slug = post.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        }

        if (post.changed('content')) {
          const wordCount = post.content.split(/\s+/).length;
          post.readTime = Math.ceil(wordCount / 200);
        }

        // Set published date when publishing
        if (post.changed('status') && post.status === 'published' && !post.publishedAt) {
          post.publishedAt = new Date();
        }
      }
    },
    scopes: {
      published: {
        where: {
          status: 'published',
          publishedAt: {
            [sequelize.Sequelize.Op.lte]: new Date()
          }
        }
      },
      featured: {
        where: {
          isFeatured: true
        }
      }
    }
  });

  Post.prototype.incrementViewCount = function() {
    return this.increment('viewCount');
  };

  Post.prototype.getMetaTags = function() {
    return {
      title: this.seoTitle || this.title,
      description: this.seoDescription || this.excerpt,
      keywords: this.seoKeywords?.join(', ') || this.tags?.join(', '),
      image: this.featuredImage,
      url: `/blog/${this.slug}`
    };
  };

  return Post;
};