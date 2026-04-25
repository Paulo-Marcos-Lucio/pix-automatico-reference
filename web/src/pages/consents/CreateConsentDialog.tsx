import { useState } from "react";
import { Calendar, KeyRound, Loader2, User, Wallet } from "lucide-react";
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
          <DialogTitle className="text-xl">Novo consentimento</DialogTitle>
          <DialogDescription>
            Registra uma autorização de recorrência. O consentimento começa em{" "}
            <strong className="text-foreground">"Aguardando autorização"</strong> e precisa ser
            autorizado pelo pagador num passo seguinte.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Section icon={User} title="Pagador">
            <div className="grid grid-cols-2 gap-3">
              <Field label="CPF ou CNPJ">
                <Input
                  value={payerDoc}
                  onChange={(e) => setPayerDoc(e.target.value)}
                  required
                  placeholder="00000000000"
                  className="font-mono tabular-nums"
                />
              </Field>
              <Field label="Nome">
                <Input
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  required
                  placeholder="Nome completo"
                />
              </Field>
            </div>
          </Section>

          <Section icon={KeyRound} title="Chave Pix do recebedor">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tipo">
                <Select value={keyType} onValueChange={(v) => setKeyType(v as PixKeyType)}>
                  <SelectTrigger className="h-10">
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
              <Field label="Valor da chave">
                <Input
                  value={keyValue}
                  onChange={(e) => setKeyValue(e.target.value)}
                  required
                  className="font-mono"
                />
              </Field>
            </div>
          </Section>

          <Section icon={Wallet} title="Regra de recorrência">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Frequência">
                <Select value={frequency} onValueChange={(v) => setFrequency(v as Frequency)}>
                  <SelectTrigger className="h-10">
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
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-2xs font-medium text-muted-foreground">
                    R$
                  </span>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="pl-9 tabular-nums"
                  />
                </div>
              </Field>
              <Field label="Máx. de cobranças">
                <Input
                  type="number"
                  min="1"
                  value={maxOccurrences}
                  onChange={(e) => setMaxOccurrences(e.target.value)}
                  className="tabular-nums"
                />
              </Field>
            </div>
          </Section>

          <Section icon={Calendar} title="Cronograma">
            <Field label="Data da primeira cobrança">
              <Input
                type="date"
                value={firstCharge}
                onChange={(e) => setFirstCharge(e.target.value)}
                required
              />
            </Field>
          </Section>

          <DialogFooter className="border-t border-border/60 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Criar consentimento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="flex items-center gap-2 text-2xs font-bold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-2xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
