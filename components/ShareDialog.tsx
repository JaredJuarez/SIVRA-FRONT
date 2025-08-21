'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share2, QrCode, Download, Mail, MessageCircle, Link } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import QRCode from 'qrcode';
import { BASE_SHARE } from '@/url';

interface ShareDialogProps {
  sessionCode: string;
  sessionTitle: string;
  sessionLink?: string;
  children?: React.ReactNode;
}

export function ShareDialog({ sessionCode, sessionTitle, sessionLink, children }: ShareDialogProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [open, setOpen] = useState(false);
  
  const votingUrl = `${BASE_SHARE}/vote/${sessionCode}`;

  // Generar QR cuando se abre el dialog
  useEffect(() => {
    if (open && votingUrl) {
      generateQRCode();
    }
  }, [open, votingUrl]);

  const generateQRCode = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(votingUrl, {
        width: 200,
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
      <DialogContent className="max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
            Compartir Encuesta
          </DialogTitle>
          <DialogDescription className="text-sm">
            Comparte esta encuesta con los participantes
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6">
          {/* Código QR */}
          <Card>
            <CardHeader className="text-center pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center justify-center gap-2">
                <QrCode className="h-4 w-4 sm:h-5 sm:w-5" />
                Código QR
              </CardTitle>
              <CardDescription className="text-sm">
                Escanea para acceder a la encuesta
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-3 sm:space-y-4">
              {qrCodeDataUrl ? (
                <img 
                  src={qrCodeDataUrl} 
                  alt="Código QR de la encuesta" 
                  className="border rounded-lg"
                  width={160}
                  height={160}
                />
              ) : (
                <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                    <p className="text-xs text-gray-500">Generando QR...</p>
                  </div>
                </div>
              )}
              
              <Button onClick={downloadQR} variant="outline" className="w-full text-sm">
                <Download className="h-4 w-4 mr-2" />
                Descargar QR
              </Button>
            </CardContent>
          </Card>

          {/* Enlaces */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="sessionCode" className="text-sm font-medium">Código de Sesión</Label>
              <Input 
                id="sessionCode"
                value={sessionCode} 
                readOnly 
                className="font-mono text-sm mt-1 cursor-text"
                title="Haz clic para seleccionar y copiar"
              />
            </div>

            <div>
              <Label htmlFor="votingUrl" className="text-sm font-medium">Enlace de Votación</Label>
              <Input 
                id="votingUrl"
                value={votingUrl} 
                readOnly 
                className="text-xs sm:text-sm mt-1 cursor-text"
                title="Haz clic para seleccionar y copiar"
              />
            </div>
            
            <p className="text-xs text-gray-500 text-center">
              💡 Haz clic en los campos para seleccionar y copiar el texto
            </p>
          </div>

          {/* Opciones de compartir */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Compartir via</Label>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <Button 
                variant="outline" 
                size="sm"
                onClick={shareViaEmail}
                className="flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={shareViaWhatsApp}
                className="flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>

              {typeof window !== 'undefined' && 'share' in navigator && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={shareViaNative}
                  className="flex items-center justify-center gap-2 text-xs sm:text-sm col-span-2 sm:col-span-1"
                >
                  <Link className="h-4 w-4" />
                  Más opciones
                </Button>
              )}
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <h4 className="font-medium text-blue-900 mb-2 text-sm">Instrucciones para participantes:</h4>
            <ol className="text-blue-800 space-y-1 list-decimal list-inside text-xs">
              <li>Escanea el código QR o visita el enlace</li>
              <li>Ingresa el código de sesión si es necesario: <code className="bg-blue-100 px-1 rounded text-xs">{sessionCode}</code></li>
              <li>Completa la encuesta siguiendo las instrucciones</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
