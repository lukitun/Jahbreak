module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    hooks: {
      beforeCreate: (session) => {
        if (!session.expiresAt) {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30); // 30 days
          session.expiresAt = expiryDate;
        }
      }
    },
    scopes: {
      active: {
        where: {
          isActive: true,
          expiresAt: {
            [sequelize.Sequelize.Op.gt]: new Date()
          }
        }
      }
    }
  });

  Session.prototype.isExpired = function() {
    return new Date() > this.expiresAt;
  };

  Session.prototype.deactivate = function() {
    this.isActive = false;
    return this.save();
  };

  Session.prototype.extend = function(days = 30) {
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + days);
    this.expiresAt = newExpiry;
    return this.save();
  };

  return Session;
};