'use client'

/**
 * Session List Component with Loading States
 * 
 * Implements requirements:
 * - 5.4: 会话加载、消息发送的加载动画
 * - 5.5: 骨架屏和占位符提升用户体验
 * - 6.1, 6.2: 优化长时间操作的用户反馈
 */

import React from 'react'
import {
  VStack,
  Box,
  Text,
  Button,
  HStack,
  IconButton,
  Spinner,
  Fade,
  ScaleFade
} from '@chakra-ui/react'
import { FiPlus, FiRefreshCw } from 'react-icons/fi'
import { HistoryItem } from './history-item'
import { SessionListSkeleton, SpinnerWithText } from '../loading/loading-animations'
import { ErrorNotification } from '../error/error-notification'
import type { ChatSessionSummary, ChatError } from '@/types/chat'

interface SessionListProps {
  sessions: ChatSessionSummary[]
  currentSessionId: string | null
  onSessionSwitch: (sessionId: string) => void
  onSessionDelete: (sessionId: string) => void
  onNewSession: () => void
  onRefresh?: () => void
  onLoadMore?: () => void
  
  // Loading states
  isLoading?: boolean
  isCreatingSession?: boolean
  isDeletingSession?: boolean
  isLoadingMore?: boolean
  hasMore?: boolean
  
  // Error states
  error?: ChatError | null
  onClearError?: () => void
  
  // UI states
  switchingSessionId?: string | null
  deletingSessionId?: string | null
}

export function SessionList({
  sessions,
  currentSessionId,
  onSessionSwitch,
  onSessionDelete,
  onNewSession,
  onRefresh,
  onLoadMore,
  
  // Loading states
  isLoading = false,
  isCreatingSession = false,
  isDeletingSession = false,
  isLoadingMore = false,
  hasMore = false,
  
  // Error states
  error,
  onClearError,
  
  // UI states
  switchingSessionId = null,
  deletingSessionId = null
}: SessionListProps) {

  const handleSessionClick = (sessionId: string) => {
    if (!!switchingSessionId || isDeletingSession) return
    onSessionSwitch(sessionId)
  }

  const handleSessionDelete = (sessionId: string) => {
    if (!!switchingSessionId || isDeletingSession) return
    onSessionDelete(sessionId)
  }

  const handleNewSession = () => {
    if (isCreatingSession || !!switchingSessionId || isDeletingSession) return
    onNewSession()
  }

  const handleRefresh = () => {
    if (isLoading || !!switchingSessionId || isDeletingSession) return
    onRefresh?.()
  }

  const handleLoadMore = () => {
    if (isLoadingMore || isLoading || !!switchingSessionId || isDeletingSession) return
    onLoadMore?.()
  }

  return (
    <Box h="100%" display="flex" flexDirection="column">
      {/* Header */}
      <Box p={4} borderBottom="1px solid" borderColor="gray.200">
        <HStack justify="space-between" mb={3}>
          <Text fontSize="lg" fontWeight="semibold">
            对话历史
          </Text>
          
          {onRefresh && (
            <IconButton
              aria-label="刷新列表"
              icon={isLoading ? <Spinner size="sm" /> : <FiRefreshCw />}
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              isDisabled={isLoading || !!switchingSessionId || isDeletingSession}
            />
          )}
        </HStack>

        {/* New Session Button */}
        <Button
          leftIcon={isCreatingSession ? <Spinner size="sm" /> : <FiPlus />}
          colorScheme="blue"
          size="sm"
          width="full"
          onClick={handleNewSession}
          isDisabled={isCreatingSession || !!switchingSessionId || isDeletingSession}
          isLoading={isCreatingSession}
          loadingText="创建中..."
        >
          新建对话
        </Button>
      </Box>

      {/* Error Display */}
      {error && (
        <Box p={4}>
          <ErrorNotification
            error={error}
            onDismiss={onClearError}
            compact
          />
        </Box>
      )}

      {/* Session List */}
      <Box flex="1" overflowY="auto" p={4}>
        {/* Initial Loading State */}
        {isLoading && sessions.length === 0 ? (
          <SessionListSkeleton count={5} />
        ) : sessions.length === 0 ? (
          /* Empty State */
          <Box textAlign="center" py={8}>
            <Text color="gray.500" mb={4}>
              还没有对话记录
            </Text>
            <Text fontSize="sm" color="gray.400">
              点击&quot;新建对话&quot;开始您的第一次对话
            </Text>
          </Box>
        ) : (
          /* Session Items */
          <VStack spacing={1} align="stretch">
            {sessions.map((session, index) => (
              <ScaleFade
                key={session.id}
                in={true}
                initialScale={0.9}
              >
                <HistoryItem
                  session={session}
                  isActive={session.id === currentSessionId}
                  isSwitching={switchingSessionId === session.id}
                  onClick={() => handleSessionClick(session.id)}
                  onDelete={() => handleSessionDelete(session.id)}
                />
                
                {/* Deleting Overlay */}
                {deletingSessionId === session.id && (
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg="rgba(255, 255, 255, 0.8)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="md"
                    zIndex={1}
                  >
                    <SpinnerWithText text="删除中..." size="sm" />
                  </Box>
                )}
              </ScaleFade>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <Fade in={true}>
                <Box pt={4}>
                  <Button
                    variant="ghost"
                    size="sm"
                    width="full"
                    onClick={handleLoadMore}
                    isDisabled={isLoadingMore}
                    isLoading={isLoadingMore}
                    loadingText="加载更多..."
                  >
                    {isLoadingMore ? '加载中...' : '加载更多'}
                  </Button>
                </Box>
              </Fade>
            )}

            {/* Loading More Indicator */}
            {isLoadingMore && (
              <Box py={4} textAlign="center">
                <SpinnerWithText text="加载更多对话..." size="sm" />
              </Box>
            )}
          </VStack>
        )}
      </Box>

      {/* Global Loading Overlay */}
      {(!!switchingSessionId || isDeletingSession) && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(255, 255, 255, 0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={10}
          backdropFilter="blur(1px)"
        >
          <SpinnerWithText 
            text={
              switchingSessionId 
                ? "切换对话中..." 
                : isDeletingSession 
                  ? "删除对话中..." 
                  : "处理中..."
            } 
          />
        </Box>
      )}
    </Box>
  )
}

// ============================================================================
// Compact Session List for Mobile
// ============================================================================

interface CompactSessionListProps extends Omit<SessionListProps, 'onRefresh'> {
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function CompactSessionList({
  sessions,
  currentSessionId,
  onSessionSwitch,
  onSessionDelete,
  onNewSession,
  onLoadMore,
  
  // Loading states
  isLoading = false,
  isCreatingSession = false,
  isDeletingSession = false,
  isLoadingMore = false,
  hasMore = false,
  
  // Error states
  error,
  onClearError,
  
  // UI states
  switchingSessionId = null,
  deletingSessionId = null,
  isCollapsed = false,
  onToggleCollapse
}: CompactSessionListProps) {

  if (isCollapsed) {
    return (
      <Box p={2}>
        <Button
          size="sm"
          variant="ghost"
          width="full"
          onClick={onToggleCollapse}
        >
          对话历史 ({sessions.length})
        </Button>
      </Box>
    )
  }

  return (
    <Box maxH="300px" overflowY="auto">
      <SessionList
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSessionSwitch={onSessionSwitch}
        onSessionDelete={onSessionDelete}
        onNewSession={onNewSession}
        onLoadMore={onLoadMore}
        isLoading={isLoading}
        isCreatingSession={isCreatingSession}
        isDeletingSession={isDeletingSession}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        error={error}
        onClearError={onClearError}
        switchingSessionId={switchingSessionId}
        deletingSessionId={deletingSessionId}
      />
    </Box>
  )
}