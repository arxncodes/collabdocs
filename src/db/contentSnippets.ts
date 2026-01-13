import { supabase } from './supabase';
import type { ContentSnippet, ContentCategory } from '@/types/types';

/**
 * Get all content snippets for the current user
 */
export async function getContentSnippets(userId: string): Promise<ContentSnippet[]> {
  const { data, error } = await supabase
    .from('content_snippets')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching content snippets:', error);
    return [];
  }

  return data || [];
}

/**
 * Search content snippets by query
 */
export async function searchContentSnippets(
  userId: string,
  query: string,
  category?: ContentCategory
): Promise<ContentSnippet[]> {
  let queryBuilder = supabase
    .from('content_snippets')
    .select('*')
    .eq('user_id', userId);

  // Add category filter if provided
  if (category) {
    queryBuilder = queryBuilder.eq('category', category);
  }

  // Add text search if query is provided
  if (query.trim()) {
    queryBuilder = queryBuilder.or(
      `title.ilike.%${query}%,content.ilike.%${query}%`
    );
  }

  const { data, error } = await queryBuilder.order('updated_at', { ascending: false });

  if (error) {
    console.error('Error searching content snippets:', error);
    return [];
  }

  return data || [];
}

/**
 * Create a new content snippet
 */
export async function createContentSnippet(
  userId: string,
  snippet: Omit<ContentSnippet, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<ContentSnippet | null> {
  const { data, error } = await supabase
    .from('content_snippets')
    .insert({
      user_id: userId,
      ...snippet,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating content snippet:', error);
    return null;
  }

  return data;
}

/**
 * Update a content snippet
 */
export async function updateContentSnippet(
  snippetId: string,
  updates: Partial<Omit<ContentSnippet, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<ContentSnippet | null> {
  const { data, error } = await supabase
    .from('content_snippets')
    .update(updates)
    .eq('id', snippetId)
    .select()
    .single();

  if (error) {
    console.error('Error updating content snippet:', error);
    return null;
  }

  return data;
}

/**
 * Delete a content snippet
 */
export async function deleteContentSnippet(snippetId: string): Promise<boolean> {
  const { error } = await supabase
    .from('content_snippets')
    .delete()
    .eq('id', snippetId);

  if (error) {
    console.error('Error deleting content snippet:', error);
    return false;
  }

  return true;
}

/**
 * Get snippets by category
 */
export async function getSnippetsByCategory(
  userId: string,
  category: ContentCategory
): Promise<ContentSnippet[]> {
  const { data, error } = await supabase
    .from('content_snippets')
    .select('*')
    .eq('user_id', userId)
    .eq('category', category)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching snippets by category:', error);
    return [];
  }

  return data || [];
}
