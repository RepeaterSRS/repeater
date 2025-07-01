import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import { Button } from '@/components/ui/button';

export default function Review() {
    return (
        <div className="flex h-[calc(100dvh-4rem)] w-full flex-col items-center justify-between gap-4 py-4">
            <Card className="aspect-[3/4] w-4/6 max-w-sm">
                <CardHeader className="flex flex-row items-center justify-between text-xs">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/cards">
                                    Deck
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/cards?deckid=french-deck-ID">
                                    French
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div>
                        <Button variant="ghost" size="icon">
                            <ChevronLeft />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <ChevronRight />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="text-3xl">How are you?</CardContent>
            </Card>
            <div className="flex w-full flex-row justify-center gap-4">
                <Button variant="secondary" className="h-12 w-30">
                    Forgor
                </Button>
                <Button className="h-12 w-30">I got it :)</Button>
            </div>
        </div>
    );
}
