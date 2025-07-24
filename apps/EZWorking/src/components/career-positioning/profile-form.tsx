'use client'

import React, { useEffect, useState } from 'react'

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Spinner,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Textarea,
  VStack,
  Wrap,
  WrapItem,
  useToast,
} from '@chakra-ui/react'
import {
  FiBook,
  FiBriefcase,
  FiPlus,
  FiTool,
  FiUser,
  FiX,
} from 'react-icons/fi'

import { supabase } from '../../lib/supabase'
import type { DegreeType, GenderType, SkillLevel } from '../../types/user'

interface ProfileFormProps {
  onSubmit: (data: ProfileFormData) => void
  userId?: string
}

interface ProfileFormData {
  basicInfo: {
    name: string
    age: number
    gender: GenderType | ''
    currentLocation: string
    acceptableLocations: string[]
    phone?: string
    bio?: string
  }
  education: {
    level: DegreeType | ''
    school: string
    major: string
    graduationYear?: number
    gpa?: number
    description?: string
  }
  experience: {
    totalYears: number
    currentPosition?: string
    currentCompany?: string
    previousExperiences: Array<{
      company: string
      position: string
      startDate: string
      endDate?: string
      isCurrent: boolean
      description?: string
    }>
  }
  skills: {
    professionalSkills: Array<{
      name: string
      category: string
      level: SkillLevel
      yearsExperience?: number
    }>
    knowledgeAreas: string[]
  }
}

interface ValidationErrors {
  basicInfo?: {
    name?: string
    age?: string
    gender?: string
    currentLocation?: string
  }
  education?: {
    level?: string
    school?: string
    major?: string
  }
  experience?: {
    totalYears?: string
  }
  skills?: {
    professionalSkills?: string
  }
}

export function ProfileFormComponent({ onSubmit, userId }: ProfileFormProps) {
  const toast = useToast()
  const [currentSection, setCurrentSection] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [newSkillInput, setNewSkillInput] = useState({
    name: '',
    category: '',
    level: 'intermediate' as SkillLevel,
  })
  const [newKnowledgeArea, setNewKnowledgeArea] = useState('')
  const [newAcceptableLocation, setNewAcceptableLocation] = useState('')
  const [isClient, setIsClient] = useState(false)
  const [currentYear, setCurrentYear] = useState(2024) // Default fallback year

  const [formData, setFormData] = useState<ProfileFormData>({
    basicInfo: {
      name: '',
      age: 0,
      gender: '',
      currentLocation: '',
      acceptableLocations: [],
      phone: '',
      bio: '',
    },
    education: {
      level: '',
      school: '',
      major: '',
      graduationYear: undefined,
      gpa: undefined,
      description: '',
    },
    experience: {
      totalYears: 0,
      currentPosition: '',
      currentCompany: '',
      previousExperiences: [],
    },
    skills: {
      professionalSkills: [],
      knowledgeAreas: [],
    },
  })

  // For development/testing, create a mock user ID if none provided
  const [effectiveUserId, setEffectiveUserId] = useState<string | undefined>(
    userId,
  )

  useEffect(() => {
    // Set client-side flag to avoid hydration mismatch
    setIsClient(true)

    // Set current year on client side only
    setCurrentYear(new Date().getFullYear())

    // Set effective user ID on client side only to avoid hydration mismatch
    if (!userId && typeof window !== 'undefined') {
      setEffectiveUserId('mock-user-id')
    }
  }, [userId])

  // Load existing profile data on component mount
  useEffect(() => {
    if (effectiveUserId) {
      loadExistingProfile()
    }
  }, [effectiveUserId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadExistingProfile = async () => {
    if (!effectiveUserId) return

    setIsLoading(true)
    try {
      // Load user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', effectiveUserId)
        .single()

      // Load education
      const { data: education } = await supabase
        .from('education')
        .select('*')
        .eq('user_id', effectiveUserId)
        .order('end_date', { ascending: false })
        .limit(1)
        .single()

      // Load work experience
      const { data: workExperience } = await supabase
        .from('work_experience')
        .select('*')
        .eq('user_id', effectiveUserId)
        .order('end_date', { ascending: false })

      // Load skills
      const { data: skills } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', effectiveUserId)

      // Populate form data
      if (profile) {
        setFormData((prev) => ({
          ...prev,
          basicInfo: {
            name: profile.name || '',
            age: profile.birth_date
              ? currentYear - new Date(profile.birth_date).getFullYear()
              : 0,
            gender: profile.gender || '',
            currentLocation: profile.location?.city
              ? `${profile.location.city}, ${profile.location.province}`
              : '',
            acceptableLocations: [],
            phone: profile.phone || '',
            bio: profile.bio || '',
          },
        }))
      }

      if (education) {
        setFormData((prev) => ({
          ...prev,
          education: {
            level: education.degree || '',
            school: education.school || '',
            major: education.major || '',
            graduationYear: education.end_date
              ? new Date(education.end_date).getFullYear()
              : undefined,
            gpa: education.gpa || undefined,
            description: education.description || '',
          },
        }))
      }

      if (workExperience && workExperience.length > 0) {
        const currentJob = workExperience.find((exp) => exp.is_current)
        const totalYears = Math.max(
          ...workExperience.map((exp) => {
            const start = new Date(exp.start_date)
            const end = exp.end_date
              ? new Date(exp.end_date)
              : new Date(currentYear, 11, 31)
            return Math.floor(
              (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365),
            )
          }),
        )

        setFormData((prev) => ({
          ...prev,
          experience: {
            totalYears,
            currentPosition: currentJob?.position || '',
            currentCompany: currentJob?.company || '',
            previousExperiences: workExperience.map((exp) => ({
              company: exp.company,
              position: exp.position,
              startDate: exp.start_date,
              endDate: exp.end_date || undefined,
              isCurrent: exp.is_current || false,
              description: exp.description || undefined,
            })),
          },
        }))
      }

      if (skills && skills.length > 0) {
        setFormData((prev) => ({
          ...prev,
          skills: {
            professionalSkills: skills.map((skill) => ({
              name: skill.name,
              category: skill.category,
              level: skill.level,
              yearsExperience: skill.years_experience || undefined,
            })),
            knowledgeAreas: Array.from(
              new Set(skills.map((skill) => skill.category)),
            ),
          },
        }))
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast({
        title: '加载失败',
        description: '无法加载现有档案信息',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sections = [
    { title: '基本信息', icon: FiUser, key: 'basicInfo' },
    { title: '教育背景', icon: FiBook, key: 'education' },
    { title: '工作经验', icon: FiBriefcase, key: 'experience' },
    { title: '技能特长', icon: FiTool, key: 'skills' },
  ]

  // Validation functions
  const validateBasicInfo = () => {
    const newErrors: ValidationErrors['basicInfo'] = {}

    if (!formData.basicInfo.name.trim()) {
      newErrors.name = '姓名不能为空'
    }

    if (
      !formData.basicInfo.age ||
      formData.basicInfo.age < 16 ||
      formData.basicInfo.age > 100
    ) {
      newErrors.age = '请输入有效的年龄 (16-100)'
    }

    if (!formData.basicInfo.gender) {
      newErrors.gender = '请选择性别'
    }

    if (!formData.basicInfo.currentLocation.trim()) {
      newErrors.currentLocation = '请输入当前所在地'
    }

    return newErrors
  }

  const validateEducation = () => {
    const newErrors: ValidationErrors['education'] = {}

    if (!formData.education.level) {
      newErrors.level = '请选择学历水平'
    }

    if (!formData.education.school.trim()) {
      newErrors.school = '请输入学校名称'
    }

    if (!formData.education.major.trim()) {
      newErrors.major = '请输入专业名称'
    }

    return newErrors
  }

  const validateExperience = () => {
    const newErrors: ValidationErrors['experience'] = {}

    if (formData.experience.totalYears < 0) {
      newErrors.totalYears = '工作年限不能为负数'
    }

    return newErrors
  }

  const validateSkills = () => {
    const newErrors: ValidationErrors['skills'] = {}

    if (formData.skills.professionalSkills.length === 0) {
      newErrors.professionalSkills = '请至少添加一项专业技能'
    }

    return newErrors
  }

  const validateCurrentSection = () => {
    let sectionErrors = {}

    switch (currentSection) {
      case 0:
        sectionErrors = validateBasicInfo()
        setErrors((prev) => ({ ...prev, basicInfo: sectionErrors }))
        break
      case 1:
        sectionErrors = validateEducation()
        setErrors((prev) => ({ ...prev, education: sectionErrors }))
        break
      case 2:
        sectionErrors = validateExperience()
        setErrors((prev) => ({ ...prev, experience: sectionErrors }))
        break
      case 3:
        sectionErrors = validateSkills()
        setErrors((prev) => ({ ...prev, skills: sectionErrors }))
        break
    }

    return Object.keys(sectionErrors).length === 0
  }

  const validateAllSections = () => {
    const basicInfoErrors = validateBasicInfo()
    const educationErrors = validateEducation()
    const experienceErrors = validateExperience()
    const skillsErrors = validateSkills()

    setErrors({
      basicInfo: basicInfoErrors,
      education: educationErrors,
      experience: experienceErrors,
      skills: skillsErrors,
    })

    return (
      Object.keys(basicInfoErrors).length === 0 &&
      Object.keys(educationErrors).length === 0 &&
      Object.keys(experienceErrors).length === 0 &&
      Object.keys(skillsErrors).length === 0
    )
  }

  // Check if user can navigate to a specific section
  const canNavigateToSection = (targetIndex: number) => {
    // Always allow navigation to current section or previous sections
    if (targetIndex <= currentSection) {
      return true
    }

    // For future sections, check if all previous sections are valid
    for (let i = 0; i < targetIndex; i++) {
      let sectionErrors = {}

      switch (i) {
        case 0:
          sectionErrors = validateBasicInfo()
          break
        case 1:
          sectionErrors = validateEducation()
          break
        case 2:
          sectionErrors = validateExperience()
          break
        case 3:
          sectionErrors = validateSkills()
          break
      }

      if (Object.keys(sectionErrors).length > 0) {
        return false
      }
    }

    return true
  }

  // Helper functions for managing arrays
  const addAcceptableLocation = () => {
    if (
      newAcceptableLocation.trim() &&
      !formData.basicInfo.acceptableLocations.includes(
        newAcceptableLocation.trim(),
      )
    ) {
      setFormData((prev) => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          acceptableLocations: [
            ...prev.basicInfo.acceptableLocations,
            newAcceptableLocation.trim(),
          ],
        },
      }))
      setNewAcceptableLocation('')
    }
  }

  const removeAcceptableLocation = (location: string) => {
    setFormData((prev) => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        acceptableLocations: prev.basicInfo.acceptableLocations.filter(
          (loc) => loc !== location,
        ),
      },
    }))
  }

  const addSkill = () => {
    if (newSkillInput.name.trim() && newSkillInput.category.trim()) {
      const skillExists = formData.skills.professionalSkills.some(
        (skill) =>
          skill.name.toLowerCase() === newSkillInput.name.toLowerCase(),
      )

      if (!skillExists) {
        setFormData((prev) => ({
          ...prev,
          skills: {
            ...prev.skills,
            professionalSkills: [
              ...prev.skills.professionalSkills,
              {
                name: newSkillInput.name.trim(),
                category: newSkillInput.category.trim(),
                level: newSkillInput.level,
                yearsExperience: undefined,
              },
            ],
          },
        }))
        setNewSkillInput({ name: '', category: '', level: 'intermediate' })
      }
    }
  }

  const removeSkill = (skillName: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        professionalSkills: prev.skills.professionalSkills.filter(
          (skill) => skill.name !== skillName,
        ),
      },
    }))
  }

  const addKnowledgeArea = () => {
    if (
      newKnowledgeArea.trim() &&
      !formData.skills.knowledgeAreas.includes(newKnowledgeArea.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        skills: {
          ...prev.skills,
          knowledgeAreas: [
            ...prev.skills.knowledgeAreas,
            newKnowledgeArea.trim(),
          ],
        },
      }))
      setNewKnowledgeArea('')
    }
  }

  const removeKnowledgeArea = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        knowledgeAreas: prev.skills.knowledgeAreas.filter((ka) => ka !== area),
      },
    }))
  }

  const handleNext = () => {
    if (validateCurrentSection() && currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1)
    }
  }

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const saveToDatabase = async (data: ProfileFormData) => {
    const userIdToUse = effectiveUserId
    if (!userIdToUse) {
      throw new Error('用户ID未提供')
    }

    console.log('开始保存用户档案数据...', { userId: userIdToUse, data })

    try {
      // First, ensure user profile exists in auth.users
      const { data: authUser, error: authError } = await supabase.auth.getUser()
      if (authError || !authUser.user) {
        throw new Error('用户未认证')
      }

      // Save user profile with proper email field
      const profileData = {
        id: userIdToUse,
        email: authUser.user.email || '',
        name: data.basicInfo.name,
        phone: data.basicInfo.phone || null,
        gender: data.basicInfo.gender || null,
        location: data.basicInfo.currentLocation
          ? {
              city: data.basicInfo.currentLocation.split(',')[0]?.trim() || '',
              province:
                data.basicInfo.currentLocation.split(',')[1]?.trim() || '',
              country: 'China',
            }
          : null,
        bio: data.basicInfo.bio || null,
        birth_date: data.basicInfo.age
          ? new Date(currentYear - data.basicInfo.age, 0, 1)
              .toISOString()
              .split('T')[0]
          : null,
      }

      console.log('保存用户档案...', profileData)
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert(profileData, { onConflict: 'id' })

      if (profileError) {
        console.error('用户档案保存失败:', profileError)
        throw new Error(`用户档案保存失败: ${profileError.message}`)
      }

      // Save education if provided
      if (
        data.education.level &&
        data.education.school &&
        data.education.major
      ) {
        const educationData = {
          user_id: userIdToUse,
          school: data.education.school,
          major: data.education.major,
          degree: data.education.level,
          start_date: data.education.graduationYear
            ? new Date(data.education.graduationYear - 4, 8, 1)
                .toISOString()
                .split('T')[0]
            : new Date(currentYear, 0, 1).toISOString().split('T')[0],
          end_date: data.education.graduationYear
            ? new Date(data.education.graduationYear, 5, 30)
                .toISOString()
                .split('T')[0]
            : null,
          is_current: !data.education.graduationYear,
          gpa: data.education.gpa || null,
          description: data.education.description || null,
        }

        console.log('保存教育信息...', educationData)

        // Delete existing education records first
        const { error: deleteEduError } = await supabase
          .from('education')
          .delete()
          .eq('user_id', userIdToUse)

        if (deleteEduError) {
          console.warn('删除旧教育记录时出错:', deleteEduError)
        }

        const { error: educationError } = await supabase
          .from('education')
          .insert(educationData)

        if (educationError) {
          console.error('教育信息保存失败:', educationError)
          throw new Error(`教育信息保存失败: ${educationError.message}`)
        }
      }

      // Save work experience if provided
      if (data.experience.currentPosition && data.experience.currentCompany) {
        const workExperienceData = {
          user_id: userIdToUse,
          company: data.experience.currentCompany,
          position: data.experience.currentPosition,
          employment_type: 'full_time' as const,
          start_date: new Date(currentYear - data.experience.totalYears, 0, 1)
            .toISOString()
            .split('T')[0],
          end_date: null,
          is_current: true,
          location: null,
          description: `${data.experience.totalYears}年工作经验`,
          achievements: null,
          skills_used: null,
        }

        console.log('保存工作经验...', workExperienceData)

        // Delete existing work experience first
        const { error: deleteWorkError } = await supabase
          .from('work_experience')
          .delete()
          .eq('user_id', userIdToUse)

        if (deleteWorkError) {
          console.warn('删除旧工作经验时出错:', deleteWorkError)
        }

        const { error: workError } = await supabase
          .from('work_experience')
          .insert(workExperienceData)

        if (workError) {
          console.error('工作经验保存失败:', workError)
          throw new Error(`工作经验保存失败: ${workError.message}`)
        }
      }

      // Save skills if provided
      if (data.skills.professionalSkills.length > 0) {
        const skillsData = data.skills.professionalSkills.map((skill) => ({
          user_id: userIdToUse,
          name: skill.name,
          category: skill.category,
          level: skill.level,
          years_experience: skill.yearsExperience || null,
          verified: false,
          description: null,
        }))

        console.log('保存技能信息...', skillsData)

        // Delete existing skills first
        const { error: deleteSkillsError } = await supabase
          .from('skills')
          .delete()
          .eq('user_id', userIdToUse)

        if (deleteSkillsError) {
          console.warn('删除旧技能记录时出错:', deleteSkillsError)
        }

        const { error: skillsError } = await supabase
          .from('skills')
          .insert(skillsData)

        if (skillsError) {
          console.error('技能信息保存失败:', skillsError)
          throw new Error(`技能信息保存失败: ${skillsError.message}`)
        }
      }

      console.log('所有数据保存成功!')
    } catch (error) {
      console.error('数据库保存过程中出错:', error)
      throw error
    }
  }

  const testConnection = async () => {
    try {
      console.log('Testing database connection...')

      // Test basic connection
      const { data: authData, error: authError } = await supabase.auth.getUser()
      console.log('Auth test:', { authData, authError })

      // Test if tables exist by trying to select from them
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1)

      console.log('user_profiles table test:', { profilesData, profilesError })

      const success = !profilesError

      toast({
        title: success ? '数据库连接成功' : '数据库连接失败',
        description: success ? '用户档案表可以访问' : '请检查数据库配置',
        status: success ? 'success' : 'error',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Database connection test failed:', error)
      toast({
        title: '数据库连接失败',
        description: '请检查数据库配置',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleSubmit = async () => {
    if (!validateAllSections()) {
      toast({
        title: '请完善必填信息',
        description: '请检查并填写所有必填字段',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsSaving(true)
    try {
      console.log('开始提交表单...', { userId, formData })

      // Save to database if userId is provided
      if (effectiveUserId) {
        try {
          // Use effectiveUserId for database operations
          const dataToSave = { ...formData }
          await saveToDatabase(dataToSave)
          console.log('数据库保存成功')
        } catch (dbError) {
          console.warn('数据库保存失败，但继续处理表单提交:', dbError)
          // Don't throw the error, just log it and continue
          toast({
            title: '数据保存警告',
            description: '数据可能未完全保存到数据库，但表单已提交',
            status: 'warning',
            duration: 3000,
            isClosable: true,
          })
        }
      } else {
        console.log('未提供用户ID，跳过数据库保存')
      }

      // Call the onSubmit callback
      onSubmit(formData)

      toast({
        title: '信息提交成功',
        description: '您的个人信息已保存，接下来我们将进行能力测评',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error: any) {
      console.error('提交表单时出错:', error)

      let errorMessage = '保存个人信息时出现错误，请重试'

      if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }

      toast({
        title: '保存失败',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const renderBasicInfo = () => (
    <VStack spacing={3} align="stretch">
      <FormControl isRequired isInvalid={!!errors.basicInfo?.name}>
        <FormLabel>姓名</FormLabel>
        <Input
          placeholder="请输入您的姓名"
          value={formData.basicInfo.name}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              basicInfo: { ...prev.basicInfo, name: e.target.value },
            }))
            // Clear error when user starts typing
            if (errors.basicInfo?.name) {
              setErrors((prev) => ({
                ...prev,
                basicInfo: { ...prev.basicInfo, name: undefined },
              }))
            }
          }}
        />
        <FormErrorMessage>{errors.basicInfo?.name}</FormErrorMessage>
      </FormControl>

      <HStack spacing={4}>
        <FormControl isRequired isInvalid={!!errors.basicInfo?.age}>
          <FormLabel>年龄</FormLabel>
          <NumberInput
            min={16}
            max={100}
            value={formData.basicInfo.age || ''}
            onChange={(valueString, valueNumber) => {
              setFormData((prev) => ({
                ...prev,
                basicInfo: { ...prev.basicInfo, age: valueNumber || 0 },
              }))
              if (errors.basicInfo?.age) {
                setErrors((prev) => ({
                  ...prev,
                  basicInfo: { ...prev.basicInfo, age: undefined },
                }))
              }
            }}
          >
            <NumberInputField placeholder="请输入年龄" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <FormErrorMessage>{errors.basicInfo?.age}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.basicInfo?.gender}>
          <FormLabel>性别</FormLabel>
          <Select
            placeholder="请选择性别"
            value={formData.basicInfo.gender}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                basicInfo: {
                  ...prev.basicInfo,
                  gender: e.target.value as GenderType,
                },
              }))
              if (errors.basicInfo?.gender) {
                setErrors((prev) => ({
                  ...prev,
                  basicInfo: { ...prev.basicInfo, gender: undefined },
                }))
              }
            }}
          >
            <option value="male">男</option>
            <option value="female">女</option>
            <option value="other">其他</option>
          </Select>
          <FormErrorMessage>{errors.basicInfo?.gender}</FormErrorMessage>
        </FormControl>
      </HStack>

      <FormControl isRequired isInvalid={!!errors.basicInfo?.currentLocation}>
        <FormLabel>当前所在地</FormLabel>
        <Input
          placeholder="如：北京市朝阳区"
          value={formData.basicInfo.currentLocation}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              basicInfo: { ...prev.basicInfo, currentLocation: e.target.value },
            }))
            if (errors.basicInfo?.currentLocation) {
              setErrors((prev) => ({
                ...prev,
                basicInfo: { ...prev.basicInfo, currentLocation: undefined },
              }))
            }
          }}
        />
        <FormErrorMessage>{errors.basicInfo?.currentLocation}</FormErrorMessage>
      </FormControl>

      <FormControl>
        <FormLabel>联系电话</FormLabel>
        <Input
          placeholder="请输入手机号码"
          value={formData.basicInfo.phone}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              basicInfo: { ...prev.basicInfo, phone: e.target.value },
            }))
          }
        />
      </FormControl>

      <FormControl>
        <FormLabel>可接受工作地点</FormLabel>
        <HStack spacing={4}>
          <Input
            placeholder="输入城市名称"
            value={newAcceptableLocation}
            onChange={(e) => setNewAcceptableLocation(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addAcceptableLocation()
              }
            }}
            flex="1"
          />
          <Button
            leftIcon={<FiPlus />}
            onClick={addAcceptableLocation}
            size="sm"
            minW="80px"
            flexShrink={0}
          >
            添加
          </Button>
        </HStack>
        <Wrap mt={2}>
          {formData.basicInfo.acceptableLocations.map((location, index) => (
            <WrapItem key={index}>
              <Tag size="md" colorScheme="blue" variant="subtle">
                <TagLabel>{location}</TagLabel>
                <TagCloseButton
                  onClick={() => removeAcceptableLocation(location)}
                />
              </Tag>
            </WrapItem>
          ))}
        </Wrap>
      </FormControl>

      <FormControl>
        <FormLabel>个人简介</FormLabel>
        <Textarea
          placeholder="简单介绍一下您自己..."
          value={formData.basicInfo.bio}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              basicInfo: { ...prev.basicInfo, bio: e.target.value },
            }))
          }
          rows={1}
        />
      </FormControl>
    </VStack>
  )

  const renderEducation = () => (
    <VStack spacing={3} align="stretch">
      <FormControl isRequired isInvalid={!!errors.education?.level}>
        <FormLabel>学历水平</FormLabel>
        <Select
          placeholder="请选择学历"
          value={formData.education.level}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              education: {
                ...prev.education,
                level: e.target.value as DegreeType,
              },
            }))
            if (errors.education?.level) {
              setErrors((prev) => ({
                ...prev,
                education: { ...prev.education, level: undefined },
              }))
            }
          }}
        >
          <option value="high_school">高中</option>
          <option value="associate">专科</option>
          <option value="bachelor">本科</option>
          <option value="master">硕士</option>
          <option value="doctor">博士</option>
        </Select>
        <FormErrorMessage>{errors.education?.level}</FormErrorMessage>
      </FormControl>

      <FormControl isRequired isInvalid={!!errors.education?.school}>
        <FormLabel>毕业院校</FormLabel>
        <Input
          placeholder="请输入学校名称"
          value={formData.education.school}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              education: { ...prev.education, school: e.target.value },
            }))
            if (errors.education?.school) {
              setErrors((prev) => ({
                ...prev,
                education: { ...prev.education, school: undefined },
              }))
            }
          }}
        />
        <FormErrorMessage>{errors.education?.school}</FormErrorMessage>
      </FormControl>

      <HStack spacing={4}>
        <FormControl isRequired isInvalid={!!errors.education?.major}>
          <FormLabel>专业</FormLabel>
          <Input
            placeholder="请输入专业名称"
            value={formData.education.major}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                education: { ...prev.education, major: e.target.value },
              }))
              if (errors.education?.major) {
                setErrors((prev) => ({
                  ...prev,
                  education: { ...prev.education, major: undefined },
                }))
              }
            }}
          />
          <FormErrorMessage>{errors.education?.major}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel>毕业年份</FormLabel>
          <NumberInput
            min={1950}
            max={currentYear + 10}
            value={formData.education.graduationYear || ''}
            onChange={(valueString, valueNumber) =>
              setFormData((prev) => ({
                ...prev,
                education: {
                  ...prev.education,
                  graduationYear: valueNumber || undefined,
                },
              }))
            }
          >
            <NumberInputField placeholder="如：2020" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
      </HStack>

      <HStack spacing={4}>
        <FormControl>
          <FormLabel>GPA/成绩</FormLabel>
          <NumberInput
            min={0}
            max={4}
            step={0.1}
            precision={2}
            value={formData.education.gpa || ''}
            onChange={(valueString, valueNumber) =>
              setFormData((prev) => ({
                ...prev,
                education: { ...prev.education, gpa: valueNumber || undefined },
              }))
            }
          >
            <NumberInputField placeholder="如：3.5" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
      </HStack>

      <FormControl>
        <FormLabel>教育经历描述</FormLabel>
        <Textarea
          placeholder="描述您的教育背景、主要课程、获得的荣誉等..."
          value={formData.education.description}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              education: { ...prev.education, description: e.target.value },
            }))
          }
          rows={3}
        />
      </FormControl>
    </VStack>
  )

  const renderExperience = () => (
    <VStack spacing={3} align="stretch">
      <FormControl isInvalid={!!errors.experience?.totalYears}>
        <FormLabel>工作年限</FormLabel>
        <NumberInput
          min={0}
          max={50}
          value={formData.experience.totalYears}
          onChange={(valueString, valueNumber) => {
            setFormData((prev) => ({
              ...prev,
              experience: { ...prev.experience, totalYears: valueNumber || 0 },
            }))
            if (errors.experience?.totalYears) {
              setErrors((prev) => ({
                ...prev,
                experience: { ...prev.experience, totalYears: undefined },
              }))
            }
          }}
        >
          <NumberInputField placeholder="请输入工作年限" />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <FormErrorMessage>{errors.experience?.totalYears}</FormErrorMessage>
      </FormControl>

      <HStack spacing={4}>
        <FormControl>
          <FormLabel>当前职位</FormLabel>
          <Input
            placeholder="如：软件开发工程师"
            value={formData.experience.currentPosition}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                experience: {
                  ...prev.experience,
                  currentPosition: e.target.value,
                },
              }))
            }
          />
        </FormControl>

        <FormControl>
          <FormLabel>当前公司</FormLabel>
          <Input
            placeholder="如：阿里巴巴集团"
            value={formData.experience.currentCompany}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                experience: {
                  ...prev.experience,
                  currentCompany: e.target.value,
                },
              }))
            }
          />
        </FormControl>
      </HStack>

      {formData.experience.totalYears === 0 && (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>应届毕业生</AlertTitle>
            <AlertDescription>
              如果您是应届毕业生，可以填写实习经历、项目经验或相关技能。
            </AlertDescription>
          </Box>
        </Alert>
      )}
    </VStack>
  )

  const renderSkills = () => (
    <VStack spacing={3} align="stretch">
      <FormControl isRequired isInvalid={!!errors.skills?.professionalSkills}>
        <FormLabel>专业技能</FormLabel>
        <VStack spacing={3} align="stretch">
          <HStack spacing={4}>
            <Input
              placeholder="技能名称（如：JavaScript）"
              value={newSkillInput.name}
              onChange={(e) =>
                setNewSkillInput((prev) => ({ ...prev, name: e.target.value }))
              }
              flex="2"
            />
            <Input
              placeholder="技能分类（如：编程语言）"
              value={newSkillInput.category}
              onChange={(e) =>
                setNewSkillInput((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
              flex="2"
            />
            <Select
              value={newSkillInput.level}
              onChange={(e) =>
                setNewSkillInput((prev) => ({
                  ...prev,
                  level: e.target.value as SkillLevel,
                }))
              }
              minW="60px"
              flex="1"
            >
              <option value="beginner">初级</option>
              <option value="intermediate">中级</option>
              <option value="advanced">高级</option>
              <option value="expert">专家</option>
            </Select>
            <Button
              leftIcon={<FiPlus />}
              onClick={addSkill}
              size="sm"
              colorScheme="blue"
              minW="80px"
              flexShrink={0}
            >
              添加
            </Button>
          </HStack>

          <Wrap>
            {formData.skills.professionalSkills.map((skill, index) => (
              <WrapItem key={index}>
                <Tag size="md" colorScheme="blue" variant="subtle">
                  <TagLabel>
                    {skill.name} (
                    {skill.level === 'beginner'
                      ? '初级'
                      : skill.level === 'intermediate'
                        ? '中级'
                        : skill.level === 'advanced'
                          ? '高级'
                          : '专家'}
                    )
                  </TagLabel>
                  <TagCloseButton onClick={() => removeSkill(skill.name)} />
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        </VStack>
        <FormErrorMessage>{errors.skills?.professionalSkills}</FormErrorMessage>
      </FormControl>

      <FormControl>
        <FormLabel>知识领域</FormLabel>
        <VStack spacing={3} align="stretch">
          <HStack spacing={4}>
            <Input
              placeholder="知识领域（如：前端开发、数据分析）"
              value={newKnowledgeArea}
              onChange={(e) => setNewKnowledgeArea(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addKnowledgeArea()
                }
              }}
              flex="1"
            />
            <Button
              leftIcon={<FiPlus />}
              onClick={addKnowledgeArea}
              size="sm"
              minW="80px"
              flexShrink={0}
            >
              添加
            </Button>
          </HStack>

          <Wrap>
            {formData.skills.knowledgeAreas.map((area, index) => (
              <WrapItem key={index}>
                <Tag size="md" colorScheme="green" variant="subtle">
                  <TagLabel>{area}</TagLabel>
                  <TagCloseButton onClick={() => removeKnowledgeArea(area)} />
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        </VStack>
      </FormControl>
    </VStack>
  )

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 0:
        return renderBasicInfo()
      case 1:
        return renderEducation()
      case 2:
        return renderExperience()
      case 3:
        return renderSkills()
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <Card
        mt={4}
        borderWidth="2px"
        borderColor="blue.200"
        maxW="95%"
        w="full"
        mx="auto"
      >
        <CardBody>
          <VStack spacing={4} align="center" py={8}>
            <Spinner size="lg" color="blue.500" />
            <Text color="gray.600">正在加载您的档案信息...</Text>
          </VStack>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card
      mt={4}
      borderWidth="2px"
      borderColor="blue.200"
      maxW="95%"
      w="full"
      mx="auto"
    >
      <CardHeader pb={2}>
        <VStack spacing={2} align="stretch">
          <HStack justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold" color="blue.700">
              个人信息收集
            </Text>
            <Badge colorScheme="blue" variant="subtle">
              {currentSection + 1} / {sections.length}
            </Badge>
          </HStack>

          <HStack spacing={2} justify="center">
            {sections.map((section, index) => {
              const isCompleted = index < currentSection
              const isCurrent = index === currentSection
              const hasErrors =
                (index === 0 &&
                  Object.keys(errors.basicInfo || {}).length > 0) ||
                (index === 1 &&
                  Object.keys(errors.education || {}).length > 0) ||
                (index === 2 &&
                  Object.keys(errors.experience || {}).length > 0) ||
                (index === 3 && Object.keys(errors.skills || {}).length > 0)
              const canNavigate = canNavigateToSection(index)

              return (
                <Box
                  key={section.key}
                  w={8}
                  h={8}
                  bg={
                    hasErrors
                      ? 'red.500'
                      : isCompleted
                        ? 'green.500'
                        : isCurrent
                          ? 'blue.500'
                          : 'gray.200'
                  }
                  color={
                    hasErrors || isCompleted || isCurrent ? 'white' : 'gray.500'
                  }
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="sm"
                  fontWeight="bold"
                  cursor={canNavigate ? 'pointer' : 'not-allowed'}
                  onClick={() => {
                    if (canNavigate) {
                      setCurrentSection(index)
                    } else {
                      toast({
                        title: '无法跳转',
                        description: '请先完成当前步骤的必填项',
                        status: 'warning',
                        duration: 3000,
                        isClosable: true,
                      })
                    }
                  }}
                  transition="all 0.2s"
                  _hover={{
                    transform: canNavigate ? 'scale(1.1)' : 'none',
                    opacity: canNavigate ? 1 : 0.7,
                  }}
                  opacity={canNavigate ? 1 : 0.6}
                >
                  {hasErrors ? <FiX /> : index + 1}
                </Box>
              )
            })}
          </HStack>
        </VStack>
      </CardHeader>

      <Divider />

      <CardBody py={4}>
        <VStack spacing={4} align="stretch">
          <HStack spacing={2} align="center">
            <Box as={sections[currentSection].icon} color="blue.500" />
            <Text fontSize="md" fontWeight="medium">
              {sections[currentSection].title}
            </Text>
          </HStack>

          {renderCurrentSection()}

          <HStack justify="space-between" pt={3}>
            <HStack>
              <Button
                variant="outline"
                onClick={handlePrevious}
                isDisabled={currentSection === 0 || isSaving}
              >
                上一步
              </Button>

              {isClient && process.env.NODE_ENV === 'development' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={testConnection}
                  colorScheme="gray"
                >
                  测试连接
                </Button>
              )}
            </HStack>

            {currentSection === sections.length - 1 ? (
              <Button
                colorScheme="blue"
                onClick={handleSubmit}
                isLoading={isSaving}
                loadingText="保存中..."
              >
                提交信息
              </Button>
            ) : (
              <Button
                colorScheme="blue"
                onClick={handleNext}
                isDisabled={isSaving}
              >
                下一步
              </Button>
            )}
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  )
}
