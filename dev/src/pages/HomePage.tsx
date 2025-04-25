/**
 * Home page component
 */

import React from 'react';
import { CurrentAgendaThread } from '@/components/agenda/AgendaThread';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { CalendarPlus, Users } from 'lucide-react';

/**
 * The main page of the application, displays the current agenda thread
 */
export default function HomePage() {
  const { user } = useCurrentUser();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container py-6">
          {!user ? (
            <div className="mx-auto max-w-3xl text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">Kep: Better Meeting Agendas</h1>
              <p className="text-xl text-muted-foreground mb-6">
                A collaborative platform for distributed teams to create meeting agendas together.
                Log in with your Nostr identity to get started.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>Log in to participate</span>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-2">Submit anonymously</h3>
                  <p className="text-muted-foreground">
                    Share your ideas and concerns without revealing your identity.
                  </p>
                </div>
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-2">Collaborative focus</h3>
                  <p className="text-muted-foreground">
                    Everyone can contribute to create more inclusive and relevant agendas.
                  </p>
                </div>
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-2">Accessible everywhere</h3>
                  <p className="text-muted-foreground">
                    Works across time zones with multiple accessibility features.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h1 className="text-3xl font-bold">This Week's Agenda</h1>
                  <p className="text-muted-foreground">
                    Submit topics, questions, and discussion points for your team's next meeting.
                  </p>
                </div>
                <Button className="flex items-center gap-2" variant="outline">
                  <CalendarPlus className="h-4 w-4" />
                  <span>View Past Threads</span>
                </Button>
              </div>
              <CurrentAgendaThread />
            </>
          )}
        </div>
      </main>
      
      <footer className="border-t py-6 bg-muted/40">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            <strong>Kep</strong> - Built on Nostr - {new Date().getFullYear()}
          </p>
          <p className="mt-1">
            A privacy-first collaborative agenda builder for distributed teams
          </p>
        </div>
      </footer>
    </div>
  );
}