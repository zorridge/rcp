import { Chat } from './components/chat/main';

export default function Page() {
  return (
    <div className="h-screen w-full p-6">
      <div className="grid h-full grid-rows-[auto_auto_1fr] gap-6">
        <div className="grid grid-cols-12 items-center gap-6">
          <div className="col-span-3">
            <div className="rounded-md border p-3">Patient Name</div>
          </div>

          <div className="col-span-4">
            <div className="rounded-md border p-3">Time Range</div>
          </div>

          <div className="col-span-5 flex justify-end">
            <div className="rounded-md border p-3">Clinician Profile</div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <div className="flex h-28 items-center justify-center rounded-full border">
              Metric 1
            </div>
          </div>
          <div className="col-span-3">
            <div className="flex h-28 items-center justify-center rounded-full border">
              Metric 2
            </div>
          </div>
          <div className="col-span-3">
            <div className="flex h-28 items-center justify-center rounded-full border">
              Metric 3
            </div>
          </div>
          <div className="col-span-3">
            <div className="flex h-28 items-center justify-center rounded-full border">
              Metric 4
            </div>
          </div>
        </div>

        <div className="grid h-full grid-cols-12 gap-6">
          <div className="col-span-6">
            <Chat />
          </div>

          <div className="col-span-6 rounded-md border p-4">Chart Area</div>
        </div>
      </div>
    </div>
  );
}
