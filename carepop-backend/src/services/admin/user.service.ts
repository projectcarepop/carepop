import { supabase } from '@/config/supabaseClient';
import { Database } from '@/types/supabase.types';
import { AppError } from '@/lib/utils/appError';
import { StatusCodes } from 'http-status-codes';
import { PostgrestError } from '@supabase/postgrest-js';
import logger from '@/utils/logger';

// @TODO: Regenerate Supabase types to include users_view
type UserView = any; // Database['public']['Views']['users_view']['Row'];

export class UserAdminService {
  private viewName = 'users_view' as const;
  private rolesTableName = 'user_roles' as const;

  private handleError(error: PostgrestError | { message: string }, context: string): never {
    logger.error(`Supabase error in UserAdminService (${context}):`, error);
    throw new AppError(error.message || `Database operation failed: ${context}`, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  async findAll(options: { page: number; limit: number; search?: string; sortBy: string; sortOrder: 'asc' | 'desc' }) {
    const { page, limit, search, sortBy, sortOrder } = options;
    
    let query = supabase
      .from(this.viewName)
      .select('*', { count: 'exact' });

    if (search) {
      // Search across multiple fields in the view
      query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1)
                 .order(sortBy as any, { ascending: sortOrder === 'asc' });

    const { data, error, count } = await query;
    if (error) this.handleError(error, 'findAll');
    
    const totalItems = count ?? 0;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: data || [],
      meta: { totalItems, itemsPerPage: limit, currentPage: page, totalPages },
    };
  }

  async findOne(id: string): Promise<UserView | null> {
    const { data, error } = await supabase
      .from(this.viewName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) this.handleError(error, 'findOne');
    return data;
  }

  async updateUserRoles(userId: string, roles: string[]): Promise<void> {
    // This should ideally be in a transaction. Supabase RPC is better for this.
    // For now, we delete then insert.
    
    // 1. Delete existing roles for the user
    const { error: deleteError } = await supabase
      .from(this.rolesTableName)
      .delete()
      .eq('user_id', userId);
      
    if (deleteError) {
        this.handleError(deleteError, 'updateUserRoles-delete');
    }

    // 2. Insert new roles
    const newRoles = roles.map(role => ({ user_id: userId, role }));
    const { error: insertError } = await supabase
        .from(this.rolesTableName)
        .insert(newRoles);

    if (insertError) {
        this.handleError(insertError, 'updateUserRoles-insert');
    }

    logger.info(`Successfully updated roles for user ${userId}`);
  }
} 