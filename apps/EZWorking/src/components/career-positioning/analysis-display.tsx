'use client'

import React, { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Badge,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  CircularProgress,
  CircularProgressLabel,
  List,
  ListItem,
  ListIcon,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Flex,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  Tooltip,
} from '@chakra-ui/react'
import {
  FiUser,
  FiBriefcase,
  FiTrendingUp,
  FiTarget,
  FiStar,
  FiArrowRight,
  FiCheckCircle,
  FiAlertCircle,
  FiBarChart,
  FiAward,
} from 'react-icons/fi'

import { ChatMessageCard } from './step-container'
import type { CareerAnalysisData } from '../../utils/mock-analysis-data'

interface AnalysisDisplayProps {
  analysisData: CareerAnalysisData
  onInteraction?: (interaction: AnalysisInteraction) => void
  onContinue?: () => void
}

interface AnalysisInteraction {
  type: 'expand_section' | 'view_details' | 'request_explanation'
  section: string
  data?: any
}

export function AnalysisDisplayComponent({
  analysisData,
  onInteraction,
  onContinue,
}: AnalysisDisplayProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const accentColor = useColorModeValue('blue.500', 'blue.300')

  const handleSectionExpand = (section: string) => {
    const isExpanded = expandedSections.includes(section)
    if (isExpanded) {
      setExpandedSections(prev => prev.filter(s => s !== section))
    } else {
      setExpandedSections(prev => [...prev, section])
    }

    onInteraction?.({
      type: 'expand_section',
      section,
      data: { expanded: !isExpanded }
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green'
    if (score >= 60) return 'yellow'
    return 'red'
  }

  const getSkillLevelColor = (current: number, recommended: number) => {
    if (current >= recommended) return 'green'
    if (current >= recommended - 1) return 'yellow'
    return 'red'
  }

  return (
    <ChatMessageCard
      title="🎯 您的职业分析报告"
      description="基于您的个人信息和评估结果，我们为您生成了详细的职业分析报告"
      variant="result"
    >
      <VStack spacing={6} align="stretch">
        {/* Overview Summary */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader pb={2}>
            <HStack>
              <FiUser color={accentColor} />
              <Text fontSize="lg" fontWeight="semibold">
                个性特征概览
              </Text>
            </HStack>
          </CardHeader>
          <CardBody pt={2}>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontSize="xl" fontWeight="bold" color={accentColor} mb={2}>
                  {analysisData.personalityProfile.primaryType}
                </Text>
                <Text color="gray.600" fontSize="sm">
                  您的核心个性类型，这将影响您的工作风格和职业选择
                </Text>
              </Box>

              {/* Top Traits */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {analysisData.personalityProfile.traits.slice(0, 4).map((trait, index) => (
                  <Box key={index}>
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="sm" fontWeight="medium">
                        {trait.name}
                      </Text>
                      <Badge colorScheme={getScoreColor(trait.score)} variant="subtle">
                        {trait.score}%
                      </Badge>
                    </HStack>
                    <Progress
                      value={trait.score}
                      colorScheme={getScoreColor(trait.score)}
                      size="sm"
                      borderRadius="full"
                    />
                  </Box>
                ))}
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>

        {/* Detailed Analysis Tabs */}
        <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
          <TabList>
            <Tab fontSize="sm">
              <HStack spacing={2}>
                <FiUser size={16} />
                <Text>个性分析</Text>
              </HStack>
            </Tab>
            <Tab fontSize="sm">
              <HStack spacing={2}>
                <FiBriefcase size={16} />
                <Text>职业匹配</Text>
              </HStack>
            </Tab>
            <Tab fontSize="sm">
              <HStack spacing={2}>
                <FiBarChart size={16} />
                <Text>技能分析</Text>
              </HStack>
            </Tab>
            <Tab fontSize="sm">
              <HStack spacing={2}>
                <FiTarget size={16} />
                <Text>发展建议</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Personality Analysis Tab */}
            <TabPanel px={0}>
              <VStack spacing={4} align="stretch">
                {/* Detailed Traits */}
                <Card>
                  <CardHeader>
                    <Text fontWeight="semibold">详细特征分析</Text>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      {analysisData.personalityProfile.traits.map((trait, index) => (
                        <Box key={index}>
                          <HStack justify="space-between" mb={2}>
                            <Text fontWeight="medium">{trait.name}</Text>
                            <HStack>
                              <CircularProgress
                                value={trait.score}
                                color={getScoreColor(trait.score) + '.400'}
                                size="40px"
                              >
                                <CircularProgressLabel fontSize="xs">
                                  {trait.score}
                                </CircularProgressLabel>
                              </CircularProgress>
                            </HStack>
                          </HStack>
                          <Text fontSize="sm" color="gray.600">
                            {trait.description}
                          </Text>
                          {index < analysisData.personalityProfile.traits.length - 1 && (
                            <Divider mt={3} />
                          )}
                        </Box>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Strengths and Development Areas */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Card>
                    <CardHeader>
                      <HStack>
                        <FiStar color="green.500" />
                        <Text fontWeight="semibold" color="green.600">
                          核心优势
                        </Text>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <List spacing={2}>
                        {analysisData.personalityProfile.strengths.map((strength, index) => (
                          <ListItem key={index} fontSize="sm">
                            <ListIcon as={FiCheckCircle} color="green.500" />
                            {strength}
                          </ListItem>
                        ))}
                      </List>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader>
                      <HStack>
                        <FiTrendingUp color="orange.500" />
                        <Text fontWeight="semibold" color="orange.600">
                          发展领域
                        </Text>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <List spacing={2}>
                        {analysisData.personalityProfile.developmentAreas.map((area, index) => (
                          <ListItem key={index} fontSize="sm">
                            <ListIcon as={FiAlertCircle} color="orange.500" />
                            {area}
                          </ListItem>
                        ))}
                      </List>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              </VStack>
            </TabPanel>

            {/* Career Fit Tab */}
            <TabPanel px={0}>
              <VStack spacing={4} align="stretch">
                {/* Suitable Roles */}
                <Card>
                  <CardHeader>
                    <Text fontWeight="semibold">推荐职位</Text>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      {analysisData.careerFit.suitableRoles.map((role, index) => (
                        <Box key={index}>
                          <HStack justify="space-between" mb={2}>
                            <Text fontWeight="medium">{role.title}</Text>
                            <Badge
                              colorScheme={getScoreColor(role.fitScore)}
                              variant="solid"
                              borderRadius="full"
                            >
                              匹配度 {role.fitScore}%
                            </Badge>
                          </HStack>
                          <Progress
                            value={role.fitScore}
                            colorScheme={getScoreColor(role.fitScore)}
                            size="sm"
                            borderRadius="full"
                            mb={2}
                          />
                          <List spacing={1}>
                            {role.reasons.map((reason, reasonIndex) => (
                              <ListItem key={reasonIndex} fontSize="sm" color="gray.600">
                                <ListIcon as={FiArrowRight} color="blue.400" />
                                {reason}
                              </ListItem>
                            ))}
                          </List>
                          {index < analysisData.careerFit.suitableRoles.length - 1 && (
                            <Divider mt={3} />
                          )}
                        </Box>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Industries */}
                <Card>
                  <CardHeader>
                    <Text fontWeight="semibold">适合行业</Text>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {analysisData.careerFit.industries.map((industry, index) => (
                        <Box key={index} p={3} borderWidth="1px" borderRadius="md">
                          <HStack justify="space-between" mb={2}>
                            <Text fontWeight="medium">{industry.name}</Text>
                            <Badge colorScheme={getScoreColor(industry.fitScore)}>
                              {industry.fitScore}%
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" color="gray.600">
                            {industry.description}
                          </Text>
                        </Box>
                      ))}
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Work Environments */}
                <Card>
                  <CardHeader>
                    <Text fontWeight="semibold">理想工作环境</Text>
                  </CardHeader>
                  <CardBody>
                    <Wrap>
                      {analysisData.careerFit.workEnvironments.map((env, index) => (
                        <WrapItem key={index}>
                          <Tag size="md" colorScheme="blue" variant="subtle">
                            <TagLabel>{env}</TagLabel>
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Skills Analysis Tab */}
            <TabPanel px={0}>
              <VStack spacing={4} align="stretch">
                {/* Technical Skills */}
                <Card>
                  <CardHeader>
                    <Text fontWeight="semibold">技术技能分析</Text>
                  </CardHeader>
                  <CardBody>
                    <Accordion allowMultiple>
                      {analysisData.skillsAnalysis.technicalSkills.map((category, categoryIndex) => (
                        <AccordionItem key={categoryIndex}>
                          <AccordionButton>
                            <Box flex="1" textAlign="left">
                              <Text fontWeight="medium">{category.category}</Text>
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                          <AccordionPanel pb={4}>
                            <VStack spacing={3} align="stretch">
                              {category.skills.map((skill, skillIndex) => (
                                <Box key={skillIndex}>
                                  <HStack justify="space-between" mb={1}>
                                    <Text fontSize="sm" fontWeight="medium">
                                      {skill.name}
                                    </Text>
                                    <HStack spacing={2}>
                                      <Badge
                                        colorScheme={getSkillLevelColor(skill.currentLevel, skill.recommendedLevel)}
                                        variant="subtle"
                                      >
                                        当前: {skill.currentLevel}/5
                                      </Badge>
                                      <Badge colorScheme="blue" variant="outline">
                                        建议: {skill.recommendedLevel}/5
                                      </Badge>
                                    </HStack>
                                  </HStack>
                                  <HStack spacing={2}>
                                    <Progress
                                      value={(skill.currentLevel / 5) * 100}
                                      colorScheme={getSkillLevelColor(skill.currentLevel, skill.recommendedLevel)}
                                      size="sm"
                                      borderRadius="full"
                                      flex="1"
                                    />
                                    <Tooltip label={`重要程度: ${skill.importance}/5`}>
                                      <HStack spacing={0}>
                                        {Array.from({ length: 5 }, (_, i) => (
                                          <FiStar
                                            key={i}
                                            size={12}
                                            color={i < skill.importance ? '#F6AD55' : '#E2E8F0'}
                                          />
                                        ))}
                                      </HStack>
                                    </Tooltip>
                                  </HStack>
                                </Box>
                              ))}
                            </VStack>
                          </AccordionPanel>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardBody>
                </Card>

                {/* Soft Skills */}
                <Card>
                  <CardHeader>
                    <Text fontWeight="semibold">软技能评估</Text>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {analysisData.skillsAnalysis.softSkills.map((skill, index) => (
                        <Box key={index} p={3} borderWidth="1px" borderRadius="md">
                          <HStack justify="space-between" mb={2}>
                            <Text fontWeight="medium">{skill.name}</Text>
                            <CircularProgress
                              value={skill.score}
                              color={getScoreColor(skill.score) + '.400'}
                              size="40px"
                            >
                              <CircularProgressLabel fontSize="xs">
                                {skill.score}
                              </CircularProgressLabel>
                            </CircularProgress>
                          </HStack>
                          <Text fontSize="sm" color="gray.600">
                            {skill.description}
                          </Text>
                        </Box>
                      ))}
                    </SimpleGrid>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Recommendations Tab */}
            <TabPanel px={0}>
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 1 }} spacing={4}>
                  {/* Immediate Actions */}
                  <Card>
                    <CardHeader>
                      <HStack>
                        <FiTarget color="red.500" />
                        <Text fontWeight="semibold" color="red.600">
                          立即行动 (1-3个月)
                        </Text>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <List spacing={2}>
                        {analysisData.recommendations.immediate.map((item, index) => (
                          <ListItem key={index} fontSize="sm">
                            <ListIcon as={FiCheckCircle} color="red.500" />
                            {item}
                          </ListItem>
                        ))}
                      </List>
                    </CardBody>
                  </Card>

                  {/* Short Term */}
                  <Card>
                    <CardHeader>
                      <HStack>
                        <FiTrendingUp color="orange.500" />
                        <Text fontWeight="semibold" color="orange.600">
                          短期目标 (3-12个月)
                        </Text>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <List spacing={2}>
                        {analysisData.recommendations.shortTerm.map((item, index) => (
                          <ListItem key={index} fontSize="sm">
                            <ListIcon as={FiCheckCircle} color="orange.500" />
                            {item}
                          </ListItem>
                        ))}
                      </List>
                    </CardBody>
                  </Card>

                  {/* Long Term */}
                  <Card>
                    <CardHeader>
                      <HStack>
                        <FiAward color="green.500" />
                        <Text fontWeight="semibold" color="green.600">
                          长期规划 (1-3年)
                        </Text>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <List spacing={2}>
                        {analysisData.recommendations.longTerm.map((item, index) => (
                          <ListItem key={index} fontSize="sm">
                            <ListIcon as={FiCheckCircle} color="green.500" />
                            {item}
                          </ListItem>
                        ))}
                      </List>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Action Buttons */}
        <Divider />
        <Flex justify="space-between" align="center">
          <Text fontSize="sm" color="gray.600">
            分析完成！您可以继续查看职位推荐
          </Text>
          {onContinue && (
            <Button
              colorScheme="blue"
              rightIcon={<FiArrowRight />}
              onClick={onContinue}
            >
              查看职位推荐
            </Button>
          )}
        </Flex>
      </VStack>
    </ChatMessageCard>
  )
}