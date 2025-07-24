'use client'

import React, { useState, useCallback } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Progress,
  List,
  ListItem,
  ListIcon,
  Flex,
  ButtonGroup,
  useColorModeValue,
  Collapse,
  IconButton,
  Tooltip,
  Alert,
  AlertIcon,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
} from '@chakra-ui/react'
import {
  FiMapPin,
  FiDollarSign,
  FiTrendingUp,
  FiChevronDown,
  FiChevronUp,
  FiThumbsUp,
  FiThumbsDown,
  FiMeh,
  FiCheck,
  FiStar,
} from 'react-icons/fi'

import { ChatMessageCard } from './step-container'
import type { JobRecommendation, JobRecommendationsData } from '../../utils/mock-job-recommendations'

interface JobRecommendationsProps {
  recommendationsData: JobRecommendationsData
  onFeedback?: (jobId: string, feedback: 'interested' | 'not-interested' | 'maybe') => void
  onRefineRecommendations?: () => void
  onContinue?: () => void
}



export function JobRecommendationsComponent({
  recommendationsData,
  onFeedback,
  onRefineRecommendations,
  onContinue,
}: JobRecommendationsProps) {
  const [expandedJobs, setExpandedJobs] = useState<string[]>([])
  const [jobFeedback, setJobFeedback] = useState<Record<string, 'interested' | 'not-interested' | 'maybe'>>({})

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const accentColor = useColorModeValue('blue.500', 'blue.300')

  const handleJobExpand = useCallback((jobId: string) => {
    setExpandedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    )
  }, [])

  const handleFeedback = useCallback((jobId: string, feedback: 'interested' | 'not-interested' | 'maybe') => {
    setJobFeedback(prev => ({
      ...prev,
      [jobId]: feedback
    }))
    onFeedback?.(jobId, feedback)
  }, [onFeedback])

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'green'
    if (score >= 75) return 'blue'
    if (score >= 65) return 'yellow'
    return 'orange'
  }



  const feedbackStats = recommendationsData.recommendations.reduce(
    (stats, job) => {
      const feedback = jobFeedback[job.id]
      switch (feedback) {
        case 'interested':
          stats.interested++
          break
        case 'not-interested':
          stats.notInterested++
          break
        case 'maybe':
          stats.maybe++
          break
        default:
          stats.noFeedback++
      }
      return stats
    },
    { interested: 0, notInterested: 0, maybe: 0, noFeedback: 0 }
  )

  const hasAnyFeedback = feedbackStats.interested > 0 || feedbackStats.notInterested > 0 || feedbackStats.maybe > 0

  return (
    <ChatMessageCard
      title="💼 为您推荐的职位"
      description={`基于您的个人档案和能力评估，我们为您精选了 ${recommendationsData.recommendations.length} 个匹配的职位机会`}
      variant="result"
    >
      <VStack spacing={6} align="stretch">
        {/* Feedback Summary */}
        {hasAnyFeedback && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <VStack align="start" spacing={1} flex="1">
              <Text fontSize="sm" fontWeight="medium">
                反馈统计
              </Text>
              <HStack spacing={4} fontSize="xs">
                <HStack>
                  <FiThumbsUp color="green" />
                  <Text>感兴趣: {feedbackStats.interested}</Text>
                </HStack>
                <HStack>
                  <FiMeh color="orange" />
                  <Text>考虑中: {feedbackStats.maybe}</Text>
                </HStack>
                <HStack>
                  <FiThumbsDown color="red" />
                  <Text>不感兴趣: {feedbackStats.notInterested}</Text>
                </HStack>
              </HStack>
            </VStack>
          </Alert>
        )}

        {/* Job Recommendations List */}
        <VStack spacing={4} align="stretch">
          {recommendationsData.recommendations.map((job, index) => (
            <JobRecommendationCard
              key={job.id}
              job={job}
              index={index}
              isExpanded={expandedJobs.includes(job.id)}
              feedback={jobFeedback[job.id]}
              onExpand={() => handleJobExpand(job.id)}
              onFeedback={(feedback) => handleFeedback(job.id, feedback)}
              bgColor={bgColor}
              borderColor={borderColor}
              accentColor={accentColor}
              getScoreColor={getScoreColor}
            />
          ))}
        </VStack>

        {/* Refinement Suggestions */}
        {hasAnyFeedback && (
          <Card bg={bgColor} borderColor={borderColor}>
            <CardHeader pb={2}>
              <HStack>
                <FiStar color={accentColor} />
                <Text fontSize="md" fontWeight="semibold">
                  个性化建议
                </Text>
              </HStack>
            </CardHeader>
            <CardBody pt={2}>
              <VStack spacing={3} align="stretch">
                <List spacing={2}>
                  {recommendationsData.refinementSuggestions.map((suggestion, index) => (
                    <ListItem key={index} fontSize="sm">
                      <ListIcon as={FiCheck} color="blue.400" />
                      {suggestion}
                    </ListItem>
                  ))}
                </List>
                
                {onRefineRecommendations && (
                  <Button
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    onClick={onRefineRecommendations}
                    leftIcon={<FiTrendingUp />}
                  >
                    根据反馈优化推荐
                  </Button>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Action Buttons */}
        <Divider />
        <Flex justify="space-between" align="center">
          <Text fontSize="sm" color="gray.600">
            {hasAnyFeedback 
              ? `已收到您对 ${feedbackStats.interested + feedbackStats.maybe + feedbackStats.notInterested} 个职位的反馈`
              : '请对感兴趣的职位进行标记，我们将为您提供更精准的推荐'
            }
          </Text>
          {onContinue && hasAnyFeedback && (
            <Button
              colorScheme="blue"
              rightIcon={<FiTrendingUp />}
              onClick={onContinue}
            >
              制定职业规划
            </Button>
          )}
        </Flex>
      </VStack>
    </ChatMessageCard>
  )
}

interface JobRecommendationCardProps {
  job: JobRecommendation
  index: number
  isExpanded: boolean
  feedback?: 'interested' | 'not-interested' | 'maybe'
  onExpand: () => void
  onFeedback: (feedback: 'interested' | 'not-interested' | 'maybe') => void
  bgColor: string
  borderColor: string
  accentColor: string
  getScoreColor: (score: number) => string
}

function JobRecommendationCard({
  job,
  index,
  isExpanded,
  feedback,
  onExpand,
  onFeedback,
  bgColor,
  borderColor,
  accentColor,
  getScoreColor,
}: JobRecommendationCardProps) {
  const feedbackIconData = getFeedbackIcon(feedback)

  return (
    <Card 
      bg={bgColor} 
      borderColor={feedback ? getScoreColor(job.fitScore) + '.200' : borderColor}
      borderWidth={feedback ? '2px' : '1px'}
      position="relative"
    >
      {/* Feedback Indicator */}
      {feedbackIconData && (
        <Box
          position="absolute"
          top={2}
          right={2}
          p={1}
          borderRadius="full"
          bg={feedbackIconData.color}
          color="white"
        >
          <feedbackIconData.icon size={12} />
        </Box>
      )}

      <CardHeader pb={2}>
        <VStack spacing={3} align="stretch">
          {/* Job Header */}
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={1} flex="1">
              <HStack>
                <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                  #{index + 1}
                </Badge>
                <Text fontSize="lg" fontWeight="bold">
                  {job.title}
                </Text>
              </HStack>
              
              <HStack spacing={4} fontSize="sm" color="gray.600">
                <HStack>
                  <Text>{job.company}</Text>
                </HStack>
                <HStack>
                  <FiMapPin size={14} />
                  <Text>{job.location}</Text>
                </HStack>
                <Badge colorScheme="gray" variant="outline">
                  {job.industry}
                </Badge>
              </HStack>
            </VStack>

            <VStack align="end" spacing={1}>
              <Badge
                colorScheme={getScoreColor(job.fitScore)}
                variant="solid"
                fontSize="sm"
                px={3}
                py={1}
                borderRadius="full"
              >
                匹配度 {job.fitScore}%
              </Badge>
              <Progress
                value={job.fitScore}
                colorScheme={getScoreColor(job.fitScore)}
                size="sm"
                width="80px"
                borderRadius="full"
              />
            </VStack>
          </HStack>

          {/* Salary Range */}
          {job.salaryRange && (
            <HStack>
              <FiDollarSign color={accentColor} size={16} />
              <Text fontSize="sm" fontWeight="medium" color={accentColor}>
                ¥{job.salaryRange.min.toLocaleString()} - ¥{job.salaryRange.max.toLocaleString()} / 月
              </Text>
            </HStack>
          )}

          {/* Job Description */}
          <Text fontSize="sm" color="gray.600" noOfLines={2}>
            {job.description}
          </Text>
        </VStack>
      </CardHeader>

      <CardBody pt={0}>
        <VStack spacing={4} align="stretch">
          {/* Match Reasons Preview */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2} color={accentColor}>
              匹配原因
            </Text>
            <List spacing={1}>
              {job.matchReasons.slice(0, isExpanded ? undefined : 2).map((reason, index) => (
                <ListItem key={index} fontSize="sm">
                  <ListIcon as={FiCheck} color="green.400" />
                  {reason}
                </ListItem>
              ))}
            </List>
            {!isExpanded && job.matchReasons.length > 2 && (
              <Text fontSize="xs" color="gray.500" mt={1}>
                还有 {job.matchReasons.length - 2} 个匹配原因...
              </Text>
            )}
          </Box>

          {/* Expanded Details */}
          <Collapse in={isExpanded} animateOpacity>
            <VStack spacing={4} align="stretch">
              <Divider />
              
              {/* Requirements */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2} color={accentColor}>
                  职位要求
                </Text>
                <Wrap>
                  {job.requirements.map((req, index) => (
                    <WrapItem key={index}>
                      <Tag size="sm" colorScheme="blue" variant="outline">
                        <TagLabel>{req}</TagLabel>
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>

              {/* Career Progression */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2} color={accentColor}>
                  职业发展路径
                </Text>
                <List spacing={1}>
                  {job.careerProgression.map((path, index) => (
                    <ListItem key={index} fontSize="sm">
                      <ListIcon as={FiTrendingUp} color="purple.400" />
                      {path}
                    </ListItem>
                  ))}
                </List>
              </Box>
            </VStack>
          </Collapse>

          {/* Action Buttons */}
          <HStack justify="space-between" pt={2}>
            <Button
              size="sm"
              variant="ghost"
              leftIcon={isExpanded ? <FiChevronUp /> : <FiChevronDown />}
              onClick={onExpand}
            >
              {isExpanded ? '收起详情' : '查看详情'}
            </Button>

            <ButtonGroup size="sm" variant="outline" spacing={2}>
              <Tooltip label="感兴趣">
                <IconButton
                  aria-label="感兴趣"
                  icon={<FiThumbsUp />}
                  colorScheme={feedback === 'interested' ? 'green' : 'gray'}
                  variant={feedback === 'interested' ? 'solid' : 'outline'}
                  onClick={() => onFeedback('interested')}
                />
              </Tooltip>
              
              <Tooltip label="考虑中">
                <IconButton
                  aria-label="考虑中"
                  icon={<FiMeh />}
                  colorScheme={feedback === 'maybe' ? 'yellow' : 'gray'}
                  variant={feedback === 'maybe' ? 'solid' : 'outline'}
                  onClick={() => onFeedback('maybe')}
                />
              </Tooltip>
              
              <Tooltip label="不感兴趣">
                <IconButton
                  aria-label="不感兴趣"
                  icon={<FiThumbsDown />}
                  colorScheme={feedback === 'not-interested' ? 'red' : 'gray'}
                  variant={feedback === 'not-interested' ? 'solid' : 'outline'}
                  onClick={() => onFeedback('not-interested')}
                />
              </Tooltip>
            </ButtonGroup>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  )
}

function getFeedbackIcon(feedback?: string) {
  switch (feedback) {
    case 'interested':
      return { icon: FiThumbsUp, color: 'green.500' }
    case 'not-interested':
      return { icon: FiThumbsDown, color: 'red.500' }
    case 'maybe':
      return { icon: FiMeh, color: 'yellow.500' }
    default:
      return null
  }
}