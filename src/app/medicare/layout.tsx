import MedicareLayout from "@/components/MedicareLayout";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MedicareLayout>{children}</MedicareLayout>;
}
