// Export all models
export { User, UserRole, UserStatus } from './User';
export { Category } from './Category';
export { Issue, IssueStatus, IssuePriority } from './Issue';
export { Vote, VoteType } from './Vote';
export { Comment } from './Comment';
export { Department } from './Department';

// Export database connection
export { connectDatabase, disconnectDatabase } from '../config/database'; 