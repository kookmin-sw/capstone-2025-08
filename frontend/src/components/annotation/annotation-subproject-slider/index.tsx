import { SubProject } from '@/types/project-schema';

interface Props {
  subProjects: SubProject[];
  selected: SubProject | null;
  onSelect: (sp: SubProject) => void;
}

export default function AnnotationSubProjectSlider({
  subProjects,
  selected,
  onSelect,
}: Props) {
  return (
    <div className="flex w-full space-x-4 overflow-x-auto bg-gray-100 px-6 py-4">
      {subProjects.map((sp) => (
        <div
          key={sp.id}
          onClick={() => onSelect(sp)}
          className={`flex h-[80px] min-w-[120px] cursor-pointer items-center justify-center rounded-md border text-sm ${
            selected?.id === sp.id
              ? 'border-blue-800 bg-blue-600 text-white'
              : 'bg-white text-gray-700'
          }`}
        >
          Sub #{sp.id}
        </div>
      ))}
    </div>
  );
}
