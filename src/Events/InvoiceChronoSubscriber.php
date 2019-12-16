<?php

namespace App\Events;

use App\Entity\Invoice;
use App\Repository\InvoiceRepository;
use Symfony\Component\Security\Core\Security;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\ViewEvent;
use ApiPlatform\Core\EventListener\EventPriorities;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class InvoiceChronoSubscriber implements EventSubscriberInterface
{
    private $security;

    private $repo;

    public function __construct(Security $security, InvoiceRepository $repo)
    {
        $this->security = $security;
        $this->repo = $repo;
    }

    public static function getSubscribedEvents()
    {
        return [
            KernelEvents::VIEW => ['setChronoForInvoices', EventPriorities::PRE_VALIDATE]
        ];
    }

    public function setChronoForInvoices(ViewEvent $event)
    {
        $user = $this->security->getUser();

        $invoice = $event->getControllerResult();

        $method = $event->getRequest()->getMethod();

        if ($invoice instanceof Invoice && $method === "POST") {
            
            $nextChrono = $this->repo->findNextChrono($user);

            $invoice->setChrono($nextChrono);

            if (empty($invoice->getSentAt())) {
                
                $invoice->setSentAt(new \DateTime());
            }
        }
    }
}