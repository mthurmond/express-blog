const Sequelize = require('sequelize'); 
const moment = require('moment'); 
const slug = require('slug');
const { nanoid } = require('nanoid');

module.exports = (sequelize) => {
    class Post extends Sequelize.Model {
        getShortDate() {
            const shortDate = moment(this.createdAt).format('MMMM D, YYYY');
            return shortDate; 
        }
        getShortBody() {
            let bodyHtml = this.body;
            // remove image caption tags & text
            let bodyNoCaptions = bodyHtml.replace(/<figcaption[^<]*<\/figcaption>/g, '');
            // remove all other html tags, but not text inside
            let bodyText = bodyNoCaptions.replace(/<[^>]+>/g, '');
            // remove non-breaking space html entities
            bodyText = bodyText.replace(/&nbsp;/g, ' ');
            const shortBody = bodyText.length > 340 ? `${bodyText.slice(0,340)}...` : bodyText; 
            return shortBody; 
        }
    }
    Post.init({
        title: {
            type: Sequelize.STRING, 
            allowNull: false, 
            validate: { 
                notNull: {
                    msg: 'please provide a "title" value', 
                },
                notEmpty: {
                    msg: 'please provide a "title" value', 
                },   
            },
        }, 
        body: {
            type: Sequelize.TEXT, 
            allowNull: false, 
            validate: {
                notNull: {
                    msg: 'please provide a "Body" value', 
                },
                notEmpty: {
                    msg: 'please provide a "Body" value', 
                },   
             }, 
        }, 
        slug: {
            type: Sequelize.STRING, 
            allowNull: true, 
        }, 
        status: {
            type: Sequelize.STRING, 
            allowNull: true, 
        }, 
    }, {
        hooks: {
          beforeCreate: async (post) => {
            const newSlug = await slug(post.title);
            const randomID = await nanoid(4);
            post.slug = `${newSlug}-${randomID}`;
          }, 
          beforeUpdate: async (post) => {
            const newSlug = await slug(post.title);
            const randomID = await nanoid(4);
            post.slug = `${newSlug}-${randomID}`;
          } 
        }, 
        sequelize 
    }); 

    return Post; 
};