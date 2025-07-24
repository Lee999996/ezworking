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
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react'
import {
  FiDollarSign,
  FiTrendingUp,
  FiChevronDown,
  FiChevronUp,
  FiCheck,
  FiStar,
  FiTarget,
  FiClock,
  FiBookOpen,
  FiUsers,
  FiAward,
  FiArrowRight,
  FiExternalLink,
  FiCheckCircle,
  FiAlertCircle,
  FiBarChart,
  FiGlobe,
  FiBook,
  FiLink,
  FiBriefcase,
} from 'react-icons/fi'

import { ChatMessageCard } from './step-container'
import type { 
  CareerDirectionsData, 
  CareerPath, 
  ActionItem,
  Resource 
} from '../../utils/mock-career-directions'

interface CareerDirectionsProps {
  directionsData: CareerDirectionsData
  onPathSelect?: (pathId: string) => void
  onActionComplete?: (actionId: string) => void
  onResourceClick?: (resource: Resource) => void
  onSaveDirections?: () => void
  onContinueChat?: () => void
}

// Data validation function
const validateCareerDirectionsData = (data: CareerDirectionsData): boolean => {
  if (!data || !data.summary || !data.careerPaths) {
    return false
  }
  
  if (data.careerPaths.length === 0) {
    return false
  }
  
  // Validate that recommended path exists
  const recommendedPathExists = data.careerPaths.some(path => path.id === data.summary.recommendedPath)
  if (!recommendedPathExists) {
    return false
  }
  
  return true
}

export function CareerDirectionsComponent({
  directionsData,
  onPathSelect,
  onActionComplete,
  onResourceClick,
  onSaveDirections,
  onContinueChat,
}: CareerDirectionsProps) {
  const [selectedPath, setSelectedPath] = useState<string>(directionsData.summary?.recommendedPath || '')
  const [expandedPaths, setExpandedPaths] = useState<string[]>([directionsData.summary?.recommendedPath || ''])
  const [completedActions, setCompletedActions] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState(0)

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const accentColor = useColorModeValue('blue.500', 'blue.300')

  const handlePathExpand = useCallback((pathId: string) => {
    setExpandedPaths(prev => 
      prev.includes(pathId) 
        ? prev.filter(id => id !== pathId)
        : [...prev, pathId]
    )
  }, [])

  const handlePathSelect = useCallback((pathId: string) => {
    setSelectedPath(pathId)
    onPathSelect?.(pathId)
  }, [onPathSelect])

  const handleActionComplete = useCallback((actionId: string) => {
    setCompletedActions(prev => 
      prev.includes(actionId)
        ? prev.filter(id => id !== actionId)
        : [...prev, actionId]
    )
    onActionComplete?.(actionId)
  }, [onActionComplete])

  // Validate data after hooks
  if (!validateCareerDirectionsData(directionsData)) {
    return (
      <Card bg="red.50" borderColor="red.200">
        <CardBody>
          <VStack spacing={3}>
            <FiAlertCircle size={24} color="red.500" />
            <Text color="red.600" fontWeight="medium">
              数据格式错误
            </Text>
            <Text color="red.500" fontSize="sm" textAlign="center">
              职业规划数据格式不正确，请刷新页面重试或联系技术支持
            </Text>
          </VStack>
        </CardBody>
      </Card>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'green'
    if (score >= 75) return 'blue'
    if (score >= 65) return 'yellow'
    return 'orange'
  }

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'red'
      case 'medium': return 'yellow'
      case 'low': return 'green'
      default: return 'gray'
    }
  }

  const selectedPathData = directionsData.careerPaths.find(path => path.id === selectedPath)

  return (
    <ChatMessageCard
      title="🎯 您的职业发展方向"
      description={`基于您的个人档案和职位偏好，我们为您制定了 ${directionsData.summary.totalPaths} 条职业发展路径`}
      variant="result"
    >
      <VStack spacing={6} align="stretch">
        {/* Summary Overview */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader pb={2}>
            <HStack justify="space-between">
              <HStack>
                <FiTarget color={accentColor} />
                <Text fontSize="lg" fontWeight="semibold">
                  职业规划概览
                </Text>
              </HStack>
              <Badge
                colorScheme={getScoreColor(directionsData.summary.confidenceScore)}
                variant="solid"
                fontSize="sm"
                px={3}
                py={1}
                borderRadius="full"
              >
                匹配度 {directionsData.summary.confidenceScore}%
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody pt={2}>
            <VStack spacing={3} align="stretch">
              <Text color="gray.600" fontSize="sm">
                根据您的技能评估、职位偏好和市场分析，我们推荐以下职业发展路径
              </Text>
              
              {/* Overall Recommendations */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2} color={accentColor}>
                  核心建议
                </Text>
                <List spacing={1}>
                  {directionsData.overallRecommendations.slice(0, 3).map((rec, index) => (
                    <ListItem key={index} fontSize="sm">
                      <ListIcon as={FiCheck} color="green.400" />
                      {rec}
                    </ListItem>
                  ))}
                </List>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Career Paths */}
        <VStack spacing={4} align="stretch">
          <Text fontSize="lg" fontWeight="semibold">
            推荐职业路径
          </Text>
          
          {directionsData.careerPaths.map((path, index) => (
            <CareerPathCard
              key={path.id}
              path={path}
              index={index}
              isSelected={selectedPath === path.id}
              isExpanded={expandedPaths.includes(path.id)}
              onExpand={() => handlePathExpand(path.id)}
              onSelect={() => handlePathSelect(path.id)}
              bgColor={bgColor}
              borderColor={borderColor}
              accentColor={accentColor}
              getScoreColor={getScoreColor}
              getPriorityColor={getPriorityColor}
            />
          ))}
        </VStack>

        {/* Detailed Path Information */}
        {selectedPathData && (
          <Card bg={bgColor} borderColor={borderColor} borderWidth="2px">
            <CardHeader>
              <HStack>
                <FiStar color="gold" />
                <Text fontSize="lg" fontWeight="semibold">
                  {selectedPathData.title} - 详细规划
                </Text>
              </HStack>
            </CardHeader>
            <CardBody>
              <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
                <TabList>
                  <Tab fontSize="sm">
                    <HStack spacing={2}>
                      <FiTarget size={16} />
                      <Text>行动计划</Text>
                    </HStack>
                  </Tab>
                  <Tab fontSize="sm">
                    <HStack spacing={2}>
                      <FiTrendingUp size={16} />
                      <Text>职业发展</Text>
                    </HStack>
                  </Tab>
                  <Tab fontSize="sm">
                    <HStack spacing={2}>
                      <FiBookOpen size={16} />
                      <Text>学习资源</Text>
                    </HStack>
                  </Tab>
                  <Tab fontSize="sm">
                    <HStack spacing={2}>
                      <FiBarChart size={16} />
                      <Text>市场前景</Text>
                    </HStack>
                  </Tab>
                </TabList>

                <TabPanels>
                  {/* Action Plan Tab */}
                  <TabPanel px={0}>
                    <ActionPlanSection
                      path={selectedPathData}
                      completedActions={completedActions}
                      onActionComplete={handleActionComplete}
                      getPriorityColor={getPriorityColor}
                    />
                  </TabPanel>

                  {/* Career Progression Tab */}
                  <TabPanel px={0}>
                    <CareerProgressionSection
                      path={selectedPathData}
                      accentColor={accentColor}
                    />
                  </TabPanel>

                  {/* Resources Tab */}
                  <TabPanel px={0}>
                    <ResourcesSection
                      resources={selectedPathData.resources}
                      onResourceClick={onResourceClick}
                    />
                  </TabPanel>

                  {/* Market Outlook Tab */}
                  <TabPanel px={0}>
                    <MarketOutlookSection
                      path={selectedPathData}
                      getScoreColor={getScoreColor}
                    />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        )}

        {/* Next Milestones */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <HStack>
              <FiClock color="orange.500" />
              <Text fontSize="lg" fontWeight="semibold">
                近期里程碑
              </Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              {directionsData.nextMilestones.map((milestone, index) => (
                <ActionItemCard
                  key={milestone.id}
                  action={milestone}
                  isCompleted={completedActions.includes(milestone.id)}
                  onComplete={() => handleActionComplete(milestone.id)}
                  getPriorityColor={getPriorityColor}
                />
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <Divider />
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" fontWeight="medium">
              职业规划已完成
            </Text>
            <Text fontSize="xs" color="gray.600">
              您可以保存此规划或继续与我讨论职业发展问题
            </Text>
          </VStack>
          
          <ButtonGroup spacing={3}>
            {onSaveDirections && (
              <Button
                colorScheme="green"
                variant="outline"
                leftIcon={<FiCheckCircle />}
                onClick={onSaveDirections}
              >
                保存规划
              </Button>
            )}
            {onContinueChat && (
              <Button
                colorScheme="blue"
                rightIcon={<FiArrowRight />}
                onClick={onContinueChat}
              >
                继续咨询
              </Button>
            )}
          </ButtonGroup>
        </Flex>
      </VStack>
    </ChatMessageCard>
  )
}

// Career Path Card Component
interface CareerPathCardProps {
  path: CareerPath
  index: number
  isSelected: boolean
  isExpanded: boolean
  onExpand: () => void
  onSelect: () => void
  bgColor: string
  borderColor: string
  accentColor: string
  getScoreColor: (score: number) => string
  getPriorityColor: (priority: 'high' | 'medium' | 'low') => string
}

function CareerPathCard({
  path,
  index,
  isSelected,
  isExpanded,
  onExpand,
  onSelect,
  bgColor,
  borderColor,
  accentColor,
  getScoreColor,
}: CareerPathCardProps) {
  const priorityColors = {
    primary: 'green',
    secondary: 'blue',
    alternative: 'orange'
  }

  return (
    <Card 
      bg={bgColor} 
      borderColor={isSelected ? accentColor : borderColor}
      borderWidth={isSelected ? '2px' : '1px'}
      cursor="pointer"
      onClick={onSelect}
      _hover={{ borderColor: accentColor }}
      transition="all 0.2s"
      role="button"
      tabIndex={0}
      aria-label={`选择职业路径: ${path.title}，适合度${path.suitabilityScore}%`}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
    >
      <CardHeader pb={2}>
        <VStack spacing={3} align="stretch">
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={1} flex="1">
              <HStack>
                <Badge colorScheme={priorityColors[path.priority]} variant="subtle" fontSize="xs">
                  {path.priority === 'primary' ? '推荐' : path.priority === 'secondary' ? '备选' : '可选'}
                </Badge>
                <Text fontSize="lg" fontWeight="bold">
                  {path.title}
                </Text>
              </HStack>
              
              <HStack spacing={4} fontSize="sm" color="gray.600">
                <HStack>
                  <FiClock size={14} />
                  <Text>{path.timeframe}</Text>
                </HStack>
              </HStack>
            </VStack>

            <VStack align="end" spacing={1}>
              <Badge
                colorScheme={getScoreColor(path.suitabilityScore)}
                variant="solid"
                fontSize="sm"
                px={3}
                py={1}
                borderRadius="full"
              >
                适合度 {path.suitabilityScore}%
              </Badge>
              <Progress
                value={path.suitabilityScore}
                colorScheme={getScoreColor(path.suitabilityScore)}
                size="sm"
                width="80px"
                borderRadius="full"
              />
            </VStack>
          </HStack>

          <Text fontSize="sm" color="gray.600" noOfLines={isExpanded ? undefined : 2}>
            {path.description}
          </Text>
        </VStack>
      </CardHeader>

      <CardBody pt={0}>
        <VStack spacing={4} align="stretch">
          {/* Skills Preview */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2} color={accentColor}>
              核心技能要求
            </Text>
            <Wrap>
              {path.requiredSkills.slice(0, isExpanded ? undefined : 3).map((skill, index) => (
                <WrapItem key={index}>
                  <Tag size="sm" colorScheme="blue" variant="outline">
                    <TagLabel>{skill}</TagLabel>
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
            {!isExpanded && path.requiredSkills.length > 3 && (
              <Text fontSize="xs" color="gray.500" mt={1}>
                还有 {path.requiredSkills.length - 3} 项技能要求...
              </Text>
            )}
          </Box>

          {/* Expanded Details */}
          <Collapse in={isExpanded} animateOpacity>
            <VStack spacing={4} align="stretch">
              <Divider />
              
              {/* Skill Gaps */}
              {path.skillGaps.length > 0 && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2} color="orange.500">
                    需要提升的技能
                  </Text>
                  <List spacing={1}>
                    {path.skillGaps.map((gap, index) => (
                      <ListItem key={index} fontSize="sm">
                        <ListIcon as={FiAlertCircle} color="orange.500" />
                        {gap}
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Next Steps Preview */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2} color={accentColor}>
                  关键行动步骤
                </Text>
                <List spacing={1}>
                  {path.nextSteps.slice(0, 3).map((step, index) => (
                    <ListItem key={index} fontSize="sm">
                      <ListIcon as={FiArrowRight} color="blue.400" />
                      {step.title}
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
              onClick={(e) => {
                e.stopPropagation()
                onExpand()
              }}
              aria-label={`${isExpanded ? '收起' : '展开'}${path.title}的详细信息`}
              aria-expanded={isExpanded}
            >
              {isExpanded ? '收起详情' : '查看详情'}
            </Button>

            {isSelected && (
              <Badge colorScheme="blue" variant="solid">
                已选择
              </Badge>
            )}
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  )
}

// Action Plan Section Component
interface ActionPlanSectionProps {
  path: CareerPath
  completedActions: string[]
  onActionComplete: (actionId: string) => void
  getPriorityColor: (priority: 'high' | 'medium' | 'low') => string
}

function ActionPlanSection({
  path,
  completedActions,
  onActionComplete,
  getPriorityColor,
}: ActionPlanSectionProps) {
  return (
    <VStack spacing={4} align="stretch">
      <Text fontSize="md" fontWeight="semibold">
        行动计划 ({path.nextSteps.length} 项任务)
      </Text>
      
      <VStack spacing={3} align="stretch">
        {path.nextSteps.map((action, index) => (
          <ActionItemCard
            key={action.id}
            action={action}
            isCompleted={completedActions.includes(action.id)}
            onComplete={() => onActionComplete(action.id)}
            getPriorityColor={getPriorityColor}
          />
        ))}
      </VStack>
    </VStack>
  )
}

// Action Item Card Component
interface ActionItemCardProps {
  action: ActionItem
  isCompleted: boolean
  onComplete: () => void
  getPriorityColor: (priority: 'high' | 'medium' | 'low') => string
}

function ActionItemCard({
  action,
  isCompleted,
  onComplete,
  getPriorityColor,
}: ActionItemCardProps) {
  const categoryIcons = {
    'skill-development': FiBookOpen,
    'networking': FiUsers,
    'job-search': FiTarget,
    'certification': FiAward,
    'experience': FiBriefcase,
  }

  const CategoryIcon = categoryIcons[action.category] || FiCheck

  return (
    <Card 
      size="sm" 
      variant="outline"
      opacity={isCompleted ? 0.7 : 1}
      bg={isCompleted ? 'gray.50' : 'white'}
    >
      <CardBody>
        <HStack spacing={3} align="start">
          <IconButton
            aria-label={`标记任务"${action.title}"为${isCompleted ? '未完成' : '已完成'}`}
            icon={isCompleted ? <FiCheckCircle /> : <CategoryIcon />}
            size="sm"
            colorScheme={isCompleted ? 'green' : 'gray'}
            variant={isCompleted ? 'solid' : 'outline'}
            onClick={onComplete}
            aria-pressed={isCompleted}
          />
          
          <VStack align="start" spacing={2} flex="1">
            <HStack justify="space-between" width="100%">
              <Text 
                fontWeight="medium" 
                fontSize="sm"
                textDecoration={isCompleted ? 'line-through' : 'none'}
              >
                {action.title}
              </Text>
              <HStack spacing={2}>
                <Badge 
                  colorScheme={getPriorityColor(action.priority)} 
                  size="sm"
                  variant="subtle"
                >
                  {action.priority === 'high' ? '高' : action.priority === 'medium' ? '中' : '低'}
                </Badge>
                <Badge colorScheme="gray" size="sm" variant="outline">
                  {action.timeframe}
                </Badge>
              </HStack>
            </HStack>
            
            <Text 
              fontSize="xs" 
              color="gray.600"
              textDecoration={isCompleted ? 'line-through' : 'none'}
            >
              {action.description}
            </Text>
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  )
}

// Career Progression Section Component
interface CareerProgressionSectionProps {
  path: CareerPath
  accentColor: string
}

function CareerProgressionSection({
  path,
  accentColor,
}: CareerProgressionSectionProps) {
  return (
    <VStack spacing={4} align="stretch">
      <Text fontSize="md" fontWeight="semibold">
        职业发展路径
      </Text>
      
      <VStack spacing={4} align="stretch">
        {path.careerProgression.map((step, index) => (
          <Card key={index} variant="outline">
            <CardBody>
              <VStack align="start" spacing={3}>
                <HStack justify="space-between" width="100%">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold" color={accentColor}>
                      {step.position}
                    </Text>
                    <HStack spacing={2} fontSize="sm" color="gray.600">
                      <FiClock size={14} />
                      <Text>{step.timeframe}</Text>
                    </HStack>
                  </VStack>
                  
                  {step.salaryRange && (
                    <VStack align="end" spacing={1}>
                      <HStack>
                        <FiDollarSign color={accentColor} size={16} />
                        <Text fontSize="sm" fontWeight="medium" color={accentColor}>
                          ¥{step.salaryRange.min.toLocaleString()} - ¥{step.salaryRange.max.toLocaleString()}
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        每月
                      </Text>
                    </VStack>
                  )}
                </HStack>
                
                <Text fontSize="sm" color="gray.600">
                  {step.description}
                </Text>
                
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    关键要求
                  </Text>
                  <Wrap>
                    {step.requirements.map((req, reqIndex) => (
                      <WrapItem key={reqIndex}>
                        <Tag size="sm" colorScheme="purple" variant="outline">
                          <TagLabel>{req}</TagLabel>
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </VStack>
    </VStack>
  )
}

// Resources Section Component
interface ResourcesSectionProps {
  resources: Resource[]
  onResourceClick?: (resource: Resource) => void
}

function ResourcesSection({
  resources,
  onResourceClick,
}: ResourcesSectionProps) {
  const resourceTypeIcons = {
    course: FiBookOpen,
    book: FiBook,
    website: FiGlobe,
    certification: FiAward,
    community: FiUsers,
    tool: FiTarget,
  }

  const resourceTypeLabels = {
    course: '课程',
    book: '书籍',
    website: '网站',
    certification: '认证',
    community: '社区',
    tool: '工具',
  }

  return (
    <VStack spacing={4} align="stretch">
      <Text fontSize="md" fontWeight="semibold">
        学习资源 ({resources.length} 项)
      </Text>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        {resources.map((resource, index) => {
          const ResourceIcon = resourceTypeIcons[resource.type] || FiLink
          
          return (
            <Card 
              key={resource.id} 
              variant="outline" 
              cursor={resource.url ? 'pointer' : 'default'}
              _hover={resource.url ? { borderColor: 'blue.300', transform: 'translateY(-2px)' } : {}}
              onClick={() => resource.url && onResourceClick?.(resource)}
              role={resource.url ? 'button' : undefined}
              tabIndex={resource.url ? 0 : undefined}
              aria-label={resource.url ? `打开资源: ${resource.title}` : undefined}
              onKeyDown={resource.url ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onResourceClick?.(resource)
                }
              } : undefined}
              transition="all 0.2s"
            >
              <CardBody>
                <VStack align="start" spacing={3}>
                  <HStack justify="space-between" width="100%">
                    <HStack>
                      <ResourceIcon color="blue.500" />
                      <Badge colorScheme="blue" variant="subtle" size="sm">
                        {resourceTypeLabels[resource.type]}
                      </Badge>
                    </HStack>
                    
                    <HStack spacing={2}>
                      {resource.cost && (
                        <Badge 
                          colorScheme={resource.cost === 'free' ? 'green' : 'orange'} 
                          size="sm"
                        >
                          {resource.cost === 'free' ? '免费' : resource.cost === 'paid' ? '付费' : '订阅'}
                        </Badge>
                      )}
                      {resource.url && (
                        <FiExternalLink size={14} color="gray.500" />
                      )}
                    </HStack>
                  </HStack>
                  
                  <Text fontWeight="medium" fontSize="sm">
                    {resource.title}
                  </Text>
                  
                  <Text fontSize="xs" color="gray.600">
                    {resource.description}
                  </Text>
                  
                  {resource.rating && (
                    <HStack>
                      <HStack spacing={0}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <FiStar
                            key={i}
                            size={12}
                            color={i < Math.floor(resource.rating!) ? '#F6AD55' : '#E2E8F0'}
                          />
                        ))}
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        {resource.rating.toFixed(1)}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </CardBody>
            </Card>
          )
        })}
      </SimpleGrid>
    </VStack>
  )
}

// Market Outlook Section Component
interface MarketOutlookSectionProps {
  path: CareerPath
  getScoreColor: (score: number) => string
}

function MarketOutlookSection({
  path,
  getScoreColor,
}: MarketOutlookSectionProps) {
  const demandColors = {
    high: 'green',
    medium: 'yellow',
    low: 'red'
  }

  const demandLabels = {
    high: '高需求',
    medium: '中等需求',
    low: '低需求'
  }

  return (
    <VStack spacing={4} align="stretch">
      <Text fontSize="md" fontWeight="semibold">
        市场前景分析
      </Text>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        {/* Market Demand */}
        <Card variant="outline">
          <CardBody>
            <VStack align="start" spacing={3}>
              <HStack>
                <FiTrendingUp color="blue.500" />
                <Text fontWeight="medium">市场需求</Text>
              </HStack>
              
              <HStack justify="space-between" width="100%">
                <Badge 
                  colorScheme={demandColors[path.marketOutlook.demand]} 
                  variant="solid"
                  fontSize="sm"
                  px={3}
                  py={1}
                >
                  {demandLabels[path.marketOutlook.demand]}
                </Badge>
                <Text fontSize="sm" fontWeight="medium" color="green.600">
                  {path.marketOutlook.growth}
                </Text>
              </HStack>
              
              <Text fontSize="sm" color="gray.600">
                {path.marketOutlook.description}
              </Text>
            </VStack>
          </CardBody>
        </Card>

        {/* Salary Progression */}
        <Card variant="outline">
          <CardBody>
            <VStack align="start" spacing={3}>
              <HStack>
                <FiDollarSign color="green.500" />
                <Text fontWeight="medium">薪资发展</Text>
              </HStack>
              
              <VStack align="start" spacing={2} width="100%">
                {path.salaryProgression.map((salary, index) => (
                  <HStack key={index} justify="space-between" width="100%">
                    <Text fontSize="sm" color="gray.600">
                      {index === 0 ? '起始' : index === 1 ? '中期' : '高级'}
                    </Text>
                    <Text fontSize="sm" fontWeight="medium">
                      ¥{salary.min.toLocaleString()} - ¥{salary.max.toLocaleString()}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </VStack>
  )
}