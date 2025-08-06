import { useState, useEffect, useCallback } from 'react';
import { issuesApi } from '../lib/api';

export interface Issue {
  _id: string;
  title: string;
  description: string;
  locationAddress: string;
  status: 'pending' | 'under_review' | 'approved' | 'in_progress' | 'resolved' | 'rejected' | 'duplicate';
  priority: 'low' | 'medium' | 'high' | 'critical';
  upvotesCount: number;
  downvotesCount: number;
  commentsCount: number;
  viewsCount: number;
  tags: string[];
  images: Array<{
    url: string;
    thumbnailUrl?: string;
    altText?: string;
    isPrimary: boolean;
  }>;
  reportedBy: {
    _id: string;
    name: string;
    avatar?: string;
  };
  categoryId?: {
    _id: string;
    name: string;
    iconName?: string;
    colorHex?: string;
  };
  hasUserVoted?: 'upvote' | 'downvote' | null;
  createdAt: string;
  updatedAt: string;
}

interface UseIssuesParams {
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface UseIssuesReturn {
  issues: Issue[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  refetch: () => void;
  voteOnIssue: (issueId: string, voteType: 'upvote' | 'downvote') => Promise<void>;
}

export function useIssues(params: UseIssuesParams = {}): UseIssuesReturn {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseIssuesReturn['pagination']>(null);

  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams: any = {};
      
      if (params.search) queryParams.search = params.search;
      if (params.status) queryParams.status = params.status;
      if (params.priority) queryParams.priority = params.priority;
      if (params.category) queryParams.category = params.category;
      if (params.tags?.length) queryParams.tags = params.tags;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;

      const response = await issuesApi.getIssues(queryParams);

      if (response.success && response.data) {
        setIssues(response.data.issues);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.message || 'Failed to fetch issues');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch issues');
      setIssues([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [
    params.search,
    params.status,
    params.priority,
    params.category,
    JSON.stringify(params.tags),
    params.sortBy,
    params.sortOrder,
    params.page,
    params.limit
  ]);

  const voteOnIssue = async (issueId: string, voteType: 'upvote' | 'downvote') => {
    try {
      const response = await issuesApi.voteOnIssue(issueId, voteType);
      
      if (response.success) {
        // Update the local state
        setIssues(prevIssues => 
          prevIssues.map(issue => {
            if (issue._id === issueId) {
              const newHasUserVoted = response.data?.hasUserVoted || null;
              const currentVote = issue.hasUserVoted;
              
              let upvotesCount = issue.upvotesCount;
              let downvotesCount = issue.downvotesCount;

              // Calculate new vote counts based on the change
              if (currentVote === 'upvote') {
                upvotesCount -= 1;
              } else if (currentVote === 'downvote') {
                downvotesCount -= 1;
              }

              if (newHasUserVoted === 'upvote') {
                upvotesCount += 1;
              } else if (newHasUserVoted === 'downvote') {
                downvotesCount += 1;
              }

              return {
                ...issue,
                hasUserVoted: newHasUserVoted,
                upvotesCount,
                downvotesCount
              };
            }
            return issue;
          })
        );
      } else {
        throw new Error(response.message || 'Failed to vote');
      }
    } catch (err: any) {
      throw new Error(err.message || 'Failed to vote on issue');
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  return {
    issues,
    loading,
    error,
    pagination,
    refetch: fetchIssues,
    voteOnIssue
  };
}
