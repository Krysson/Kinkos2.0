import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function ResourcesPage() {
  const supabase = await createServerSupabaseClient()

  const { data: resources } = await supabase
    .from('resources')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
    .order('title')

  const resourcesByCategory = {
    policies: resources?.filter((r) => r.category === 'policies') || [],
    training: resources?.filter((r) => r.category === 'training') || [],
    forms: resources?.filter((r) => r.category === 'forms') || [],
    links: resources?.filter((r) => r.category === 'links') || [],
    other: resources?.filter((r) => r.category === 'other') || [],
  }

  const ResourceCard = ({ title, description, url }: { title: string; description: string | null; url: string | null }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-start justify-between">
          <span className="flex-1">{title}</span>
          <FileText className="h-5 w-5 text-accent-teal flex-shrink-0" />
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {url && (
          <Button asChild variant="outline" size="sm">
            <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              Open Resource
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8 text-accent-teal" />
          Resources
        </h1>
        <p className="text-muted-foreground mt-2">Access training materials, policies, forms, and helpful links</p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources?.map((resource) => (
              <ResourceCard
                key={resource.id}
                title={resource.title}
                description={resource.description}
                url={resource.url}
              />
            ))}
          </div>
          {!resources || resources.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-muted-foreground">
                No resources available at this time.
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="training" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resourcesByCategory.training.map((resource) => (
              <ResourceCard
                key={resource.id}
                title={resource.title}
                description={resource.description}
                url={resource.url}
              />
            ))}
          </div>
          {resourcesByCategory.training.length === 0 && (
            <Card>
              <CardContent className="text-center py-12 text-muted-foreground">
                No training resources available.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="policies" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resourcesByCategory.policies.map((resource) => (
              <ResourceCard
                key={resource.id}
                title={resource.title}
                description={resource.description}
                url={resource.url}
              />
            ))}
          </div>
          {resourcesByCategory.policies.length === 0 && (
            <Card>
              <CardContent className="text-center py-12 text-muted-foreground">No policy documents available.</CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="forms" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resourcesByCategory.forms.map((resource) => (
              <ResourceCard
                key={resource.id}
                title={resource.title}
                description={resource.description}
                url={resource.url}
              />
            ))}
          </div>
          {resourcesByCategory.forms.length === 0 && (
            <Card>
              <CardContent className="text-center py-12 text-muted-foreground">No forms available.</CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="links" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resourcesByCategory.links.map((resource) => (
              <ResourceCard
                key={resource.id}
                title={resource.title}
                description={resource.description}
                url={resource.url}
              />
            ))}
          </div>
          {resourcesByCategory.links.length === 0 && (
            <Card>
              <CardContent className="text-center py-12 text-muted-foreground">No helpful links available.</CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
