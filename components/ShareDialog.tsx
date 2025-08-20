'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share2, QrCode, Copy, Download, Mail, MessageCircle, Link } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

interface ShareDialogProps {
  sessionCode: string;
  sessionTitle: string;
  sessionLink?: string;
  children?: React.ReactNode;
}

export function ShareDialog({ sessionCode, sessionTitle, sessionLink, children }: ShareDialogProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [open, setOpen] = useState(false);
  
  const votingUrl = sessionLink || `${typeof window !== 'undefined' ? window.location.origin : ''}/vote/${sessionCode}`;

  // Generar QR cuando se abre el dialog
  useEffect(() => {
    if (open && votingUrl) {
      generateQRCode();
    }
  }, [open, votingUrl]);

  const generateQRCode = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(votingUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1f2937', // gray-800
          light: '#ffffff',
        },
      });
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el código QR",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado",
        description: "Enlace copiado al portapapeles",
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive",
      });
    }
  };

  const downloadQR = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a');
      link.download = `qr-${sessionCode}.png`;
      link.href = qrCodeDataUrl;
      link.click();
      
      toast({
        title: "Descargado",
        description: "Código QR descargado exitosamente",
      });
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Invitación a encuesta: ${sessionTitle}`);
    const body = encodeURIComponent(
      `Hola,\n\nHas sido invitado a participar en la encuesta "${sessionTitle}".\n\n` +
      `Para participar, visita el siguiente enlace:\n${votingUrl}\n\n` +
      `O usa el código de sesión: ${sessionCode}\n\n¡Gracias por tu participación!`
    );
    
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(
      `¡Participa en la encuesta "${sessionTitle}"!\n\n` +
      `Enlace: ${votingUrl}\n\n` +
      `Código de sesión: ${sessionCode}`
    );
    
    window.open(`https://wa.me/?text=${message}`);
  };

  const shareViaNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: sessionTitle,
          text: `Participa en la encuesta: ${sessionTitle}`,
          url: votingUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Compartir
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartir Encuesta
          </DialogTitle>
          <DialogDescription>
            Comparte esta encuesta con los participantes
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Código QR */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-lg flex items-center justify-center gap-2">
                <QrCode className="h-5 w-5" />
                Código QR
              </CardTitle>
              <CardDescription>
                Escanea para acceder a la encuesta
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              {qrCodeDataUrl ? (
                <img 
                  src={qrCodeDataUrl} 
                  alt="Código QR de la encuesta" 
                  className="border rounded-lg"
                  width={200}
                  height={200}
                />
              ) : (
                <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Generando QR...</p>
                  </div>
                </div>
              )}
              
              <Button onClick={downloadQR} variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Descargar QR
              </Button>
            </CardContent>
          </Card>

          {/* Enlaces */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="sessionCode">Código de Sesión</Label>
              <div className="flex gap-2 mt-1">
                <Input 
                  id="sessionCode"
                  value={sessionCode} 
                  readOnly 
                  className="font-mono"
                />
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => copyToClipboard(sessionCode)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="votingUrl">Enlace de Votación</Label>
              <div className="flex gap-2 mt-1">
                <Input 
                  id="votingUrl"
                  value={votingUrl} 
                  readOnly 
                  className="text-sm"
                />
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => copyToClipboard(votingUrl)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Opciones de compartir */}
          <div className="space-y-3">
            <Label>Compartir via</Label>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={shareViaEmail}
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={shareViaWhatsApp}
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>

              {typeof window !== 'undefined' && 'share' in navigator && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={shareViaNative}
                  className="flex items-center gap-2"
                >
                  <Link className="h-4 w-4" />
                  Más opciones
                </Button>
              )}
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <h4 className="font-medium text-blue-900 mb-1">Instrucciones para participantes:</h4>
            <ol className="text-blue-800 space-y-1 list-decimal list-inside text-xs">
              <li>Escanea el código QR o visita el enlace</li>
              <li>Ingresa el código de sesión si es necesario: <code className="bg-blue-100 px-1 rounded">{sessionCode}</code></li>
              <li>Completa la encuesta siguiendo las instrucciones</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
