import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateConsent } from "@/hooks/useApi";
import { useToast } from "@/components/ui/use-toast";
import { ApiError } from "@/lib/api";
import { frequencyLabel, pixKeyTypeLabel } from "@/lib/i18n";
import type { Frequency, PixKeyType } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

export default function CreateConsentDialog({ open, onOpenChange }: Props) {
  const { toast } = useToast();
  const create = useCreateConsent();

  const [payerDoc, setPayerDoc] = useState("12345678901");
  const [payerName, setPayerName] = useState("Alice Silva");
  const [keyType, setKeyType] = useState<PixKeyType>("EMAIL");
  const [keyValue, setKeyValue] = useState("merchant@example.com");
  const [frequency, setFrequency] = useState<Frequency>("MONTHLY");
  const [amount, setAmount] = useState("99.90");
  const [firstCharge, setFirstCharge] = useState(tomorrow());
  const [maxOccurrences, setMaxOccurrences] = useState("12");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await create.mutateAsync({
        payer: { document: payerDoc, name: payerName },
        receiverKey: { type: keyType, value: keyValue },
        policy: {
          frequency,
          amount,
          currency: "BRL",
          firstCharge,
          maxOccurrences: maxOccurrences ? Number(maxOccurrences) : null,
        },
      });
      toast({
        title: "Consentimento criado",
        description: "Aguardando autorização do pagador.",
      });
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Falha ao criar consentimento",
        description: err instanceof ApiError ? err.message : String(err),
        variant: "destructive",
      });
    }
  }

  const pixKeyOptions: PixKeyType[] = ["EMAIL", "CPF", "CNPJ", "PHONE", "EVP"];
  const frequencyOptions: Frequency[] = ["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Novo consentimento</DialogTitle>
          <DialogDescription>
            Registra uma autorização de recorrência. O consentimento começa em <strong>"Aguardando autorização"</strong> e
            precisa ser autorizado pelo pagador num passo seguinte.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="CPF ou CNPJ do pagador">
              <Input value={payerDoc} onChange={(e) => setPayerDoc(e.target.value)} required />
            </Field>
            <Field label="Nome do pagador">
              <Input value={payerName} onChange={(e) => setPayerName(e.target.value)} required />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo da chave Pix">
              <Select value={keyType} onValueChange={(v) => setKeyType(v as PixKeyType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pixKeyOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {pixKeyTypeLabel[opt]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Chave Pix do recebedor">
              <Input value={keyValue} onChange={(e) => setKeyValue(e.target.value)} required />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Frequência">
              <Select value={frequency} onValueChange={(v) => setFrequency(v as Frequency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {frequencyLabel[opt]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Valor (R$)">
              <Input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </Field>
            <Field label="Nº máximo de cobranças">
              <Input
                type="number"
                min="1"
                value={maxOccurrences}
                onChange={(e) => setMaxOccurrences(e.target.value)}
              />
            </Field>
          </div>

          <Field label="Data da primeira cobrança">
            <Input
              type="date"
              value={firstCharge}
              onChange={(e) => setFirstCharge(e.target.value)}
              required
            />
          </Field>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="animate-spin" />}
              Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
