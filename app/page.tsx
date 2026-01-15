import { CircleUserIcon, TrendingUpIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Chat } from './components/chat/main';

export default function Page() {
  return (
    <div className="h-screen w-full p-6">
      <div className="grid h-full grid-rows-[auto_auto_1fr] gap-6">
        <div className="grid grid-cols-12 items-center gap-6">
          <div className="col-span-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="Name">Patient Name</Label>
              <Input id="Name" />
            </div>
          </div>
          <div className="col-span-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="TimeRange">Time Range</Label>
              <DateRangePicker />
            </div>
          </div>
          <div className="col-span-4 flex justify-end">
            <div className="flex gap-3">
              <span className="font-medium">Dr Doe (Clinician)</span>
              <CircleUserIcon />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardDescription>Path Efficiency</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  33%
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    <TrendingUpIcon />
                    +10.0%
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start text-sm">
                <div className="text-muted-foreground">Directness of path</div>
              </CardFooter>
            </Card>
          </div>
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardDescription>Force</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  100 N
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    <TrendingUpIcon />
                    +10.0%
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start text-sm">
                <div className="text-muted-foreground">
                  Force produced / assistance provided
                </div>
              </CardFooter>
            </Card>
          </div>
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardDescription>Range of Motion</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  25 cm²
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    <TrendingUpIcon />
                    +10.0%
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start text-sm">
                <div className="text-muted-foreground">
                  Maximum movement achieved
                </div>
              </CardFooter>
            </Card>
          </div>
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardDescription>SPARC</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  75
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    <TrendingUpIcon />
                    +10.0%
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start text-sm">
                <div className="text-muted-foreground">
                  Smoothness of movement
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>

        <div className="grid h-full grid-cols-12 gap-6">
          <div className="col-span-4">
            <Chat />
          </div>

          <div className="col-span-8 rounded-md border p-4">Chart Area</div>
        </div>
      </div>
    </div>
  );
}
