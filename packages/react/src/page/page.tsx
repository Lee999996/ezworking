'use client'

import * as React from 'react'

import {
  HTMLChakraProps,
  SystemProps,
  ThemingProps,
  chakra,
  createStylesContext,
  forwardRef,
  omitThemingProps,
  useMultiStyleConfig,
} from '@chakra-ui/react'
import { createContext, cx } from '@chakra-ui/utils'
import { ErrorBoundary, LoadingOverlay, LoadingSpinner } from '@saas-ui/react'

import { ErrorPage } from './error-page'

const [StylesProvider, useStyles] = createStylesContext('SuiPage')

interface PageProviderValue {
  isLoading?: boolean
  skeleton?: React.ReactNode
  hasError?: boolean
  errorComponent?: React.ReactNode
}

const [PageProvider, usePageContext] = createContext<PageProviderValue>()

export interface PageOptions {
  children?: React.ReactNode
  isLoading?: boolean
  skeleton?: React.ReactNode
  hasError?: boolean
  errorComponent?: React.ReactNode
}

export const PageTitle = forwardRef<HTMLChakraProps<'h2'>, 'div'>(
  (props, ref) => {
    const styles = useStyles()
    return <chakra.div ref={ref} __css={styles.title} as="h2" {...props} />
  },
)

PageTitle.displayName = 'PageTitle'

export const PageDescription = forwardRef<HTMLChakraProps<'div'>, 'div'>(
  (props, ref) => {
    const styles = useStyles()
    return <chakra.div ref={ref} __css={styles.description} {...props} />
  },
)

PageDescription.displayName = 'PageDescription'

export interface PageHeaderProps
  extends Omit<HTMLChakraProps<'header'>, 'title'> {
  nav?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  toolbar?: React.ReactNode
  footer?: React.ReactNode
}

export const PageHeader = forwardRef<PageHeaderProps, 'header'>(
  (props, ref) => {
    const { children, nav, title, description, toolbar, footer, ...rest } =
      props

    const styles = useStyles()

    let heading
    if (title || description) {
      heading = (
        <chakra.div className="sui-page__header-title" __css={styles.heading}>
          {typeof title === 'string' ? <PageTitle>{title}</PageTitle> : title}
          {typeof description === 'string' ? (
            <PageDescription>{description}</PageDescription>
          ) : (
            description
          )}
        </chakra.div>
      )
    }

    let _footer
    if (footer) {
      _footer = (
        <chakra.div
          className="sui-page__header-footer"
          __css={styles.headerFooter}
        >
          {footer}
        </chakra.div>
      )
    }

    return (
      <chakra.header
        ref={ref}
        __css={styles.headerContainer}
        {...rest}
        className={cx('sui-page__header', props.className)}
      >
        <chakra.div __css={styles.header} className="sui-page__header-content">
          {nav}
          {heading}
          {toolbar}
        </chakra.div>
        {children}
        {_footer}
      </chakra.header>
    )
  },
)

PageHeader.displayName = 'PageHeader'

export interface PageBodyProps extends HTMLChakraProps<'div'> {
  contentWidth?: SystemProps['maxW']
  contentProps?: HTMLChakraProps<'div'>
}

export const PageBody = forwardRef<PageBodyProps, 'div'>((props, ref) => {
  const {
    contentWidth = 'container.xl',
    children,
    contentProps,
    ...rest
  } = props

  const styles = useStyles()

  const { isLoading, skeleton, hasError, errorComponent } = usePageContext()

  let content = children
  if (isLoading) {
    content = skeleton || (
      <LoadingOverlay>
        <LoadingSpinner />
      </LoadingOverlay>
    )
  } else if (hasError) {
    content = errorComponent
  }

  return (
    <chakra.div
      ref={ref}
      {...rest}
      __css={styles.body}
      className={cx('sui-page__body', props.className)}
    >
      <chakra.div {...contentProps} maxW={contentWidth}>
        {content}
      </chakra.div>
    </chakra.div>
  )
})

PageBody.displayName = 'PageBody'

interface PageContainerProps
  extends PageOptions,
    HTMLChakraProps<'main'>,
    ThemingProps<'SuiPage'> {}

export const PageContainer = forwardRef<PageContainerProps, 'main'>(
  (props, ref) => {
    const {
      isLoading,
      errorComponent,
      skeleton,
      hasError,
      children,
      ...containerProps
    } = omitThemingProps(props)

    const styles = useMultiStyleConfig('SuiPage', props)

    const context = {
      isLoading,
      errorComponent,
      skeleton,
      hasError,
    }

    return (
      <PageProvider value={context}>
        <StylesProvider value={styles}>
          <chakra.main
            ref={ref}
            {...containerProps}
            __css={styles.container}
            className={cx('sui-page', props.className)}
          >
            {children}
          </chakra.main>
        </StylesProvider>
      </PageProvider>
    )
  },
)

PageContainer.displayName = 'PageContainer'

export interface PageProps
  extends PageOptions,
    Omit<PageContainerProps, 'title'> {}

export const Page = forwardRef<PageProps, 'main'>((props, ref) => {
  const {
    errorComponent = (
      <ErrorPage
        title="Something went wrong"
        description="We've been notified about the problem."
      />
    ),
    children,
    ...rest
  } = props

  return (
    <ErrorBoundary fallback={errorComponent}>
      <PageContainer ref={ref} errorComponent={errorComponent} {...rest}>
        {children}
      </PageContainer>
    </ErrorBoundary>
  )
})

Page.displayName = 'Page'
